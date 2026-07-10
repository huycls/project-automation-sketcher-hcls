import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  WorkflowNode, Connection, DrawingStroke, 
  BoardMode, CanvasTransform, NodeType 
} from './types';
import { templates } from './templates';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import NodeEditor from './components/NodeEditor';
import HelpModal from './components/HelpModal';
import { HelpCircle, Info } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'brutalflow_whiteboard_v1';

export default function App() {
  // --- Whiteboard Core State ---
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  
  // --- Interface Customization State ---
  const [mode, setMode] = useState<BoardMode>('select');
  const [brushColor, setBrushColor] = useState<string>('#000000');
  const [brushWidth, setBrushWidth] = useState<number>(4);
  const [transform, setTransform] = useState<CanvasTransform>({ x: 100, y: 100, scale: 0.8 });

  // --- Modals State ---
  const [editingNode, setEditingNode] = useState<WorkflowNode | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>('');

  // 1. Load initial board layout from local storage or set default template
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nodes) setNodes(parsed.nodes);
        if (parsed.connections) setConnections(parsed.connections);
        if (parsed.strokes) setStrokes(parsed.strokes);
      } catch (e) {
        console.error('Failed to load local storage state:', e);
        loadDefaultTemplate();
      }
    } else {
      // First time user: load Q&A / Flow approval template
      loadDefaultTemplate();
      setIsHelpOpen(true); // Open guide automatically to welcome the user
    }
  }, []);

  // 2. Automatically save whiteboard state to localStorage upon change
  useEffect(() => {
    if (nodes.length > 0 || connections.length > 0 || strokes.length > 0) {
      const stateToSave = { nodes, connections, strokes };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [nodes, connections, strokes]);

  const loadDefaultTemplate = () => {
    const defaultTemplate = templates[0]; // Approval flowchart
    setNodes(defaultTemplate.nodes);
    setConnections(defaultTemplate.connections);
    setStrokes([]);
  };

  // 3. Load specific template layout
  const handleLoadTemplate = (index: number) => {
    const tmpl = templates[index];
    if (tmpl) {
      setNodes(tmpl.nodes);
      setConnections(tmpl.connections);
      setStrokes([]);
      
      // Center the viewport
      setTransform({
        x: 120,
        y: 80,
        scale: 0.8
      });
    }
  };

  // 4. Reset entire board to blank canvas
  const handleClearAll = () => {
    setNodes([]);
    setConnections([]);
    setStrokes([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // 5. Clear only the hand-drawn drawing strokes
  const handleClearDrawing = () => {
    setStrokes([]);
  };

  // 6. Append new node centered in the current viewport
  const handleAddNode = (type: NodeType) => {
    // Estimate screen center in whiteboard coordinate coordinates
    const containerWidth = window.innerWidth - 320; // estimate subtracting sidebar width
    const containerHeight = window.innerHeight;
    
    // Reverse-transform center coordinates to find world-level position
    const centerX = (-transform.x + containerWidth / 2) / transform.scale;
    const centerY = (-transform.y + containerHeight / 2) / transform.scale;

    const id = `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    // Choose starting configurations based on Node types
    let title = 'Tiêu đề mới';
    let content = 'Viết ghi chú ở đây...';
    let width = 200;
    let height = 120;
    let color = '#fef08a'; // default neon yellow

    if (type === 'process') {
      title = 'HÀNH ĐỘNG';
      content = 'Quy trình xử lý tác vụ tiếp theo';
      color = '#bfdbfe'; // sky blue
    } else if (type === 'decision') {
      title = 'KIỂM TRA?';
      content = 'Điều kiện quyết định đúng/sai';
      width = 140;
      height = 140;
      color = '#fbcfe8'; // neon pink
    } else if (type === 'io') {
      title = 'DỮ LIỆU ĐẦU VÀO';
      content = 'Nhận dữ liệu từ khách hàng';
      width = 220;
      color = '#fed7aa'; // warm orange
    } else if (type === 'start_end') {
      title = 'SỰ KIỆN';
      content = 'Hoàn tất quy trình';
      width = 160;
      height = 80;
      color = '#bbf7d0'; // neon green
    }

    const newNode: WorkflowNode = {
      id,
      type,
      title,
      content,
      x: Math.round(centerX - width / 2),
      y: Math.round(centerY - height / 2),
      width,
      height,
      color
    };

    setNodes([...nodes, newNode]);
    // Set tool to pointer mode automatically so they can immediately drag it
    setMode('select');
  };

  // 7. Save updated properties from the modal NodeEditor
  const handleSaveNode = (updatedNode: WorkflowNode) => {
    setNodes(nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
  };

  // 8. Delete node and all of its associated workflow connection lines
  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId));
    setConnections(connections.filter((c) => c.fromId !== nodeId && c.toId !== nodeId));
  };

  // 9. HIGH-DPI Whiteboard cropping export engine (Helper)
  const captureWhiteboardWorkspace = async (): Promise<HTMLCanvasElement | null> => {
    const workspaceEl = document.getElementById('whiteboard-workspace');
    if (!workspaceEl) return null;

    setExporting(true);
    setExportMessage('Đang chuẩn bị bố cục xuất bản...');

    // Save active panning & zooming factors
    const savedTransform = { ...transform };

    // Find the ideal bounding box cropping region encompassing all elements on the canvas
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });

    strokes.forEach((stroke) => {
      stroke.points.forEach((pt) => {
        minX = Math.min(minX, pt.x);
        minY = Math.min(minY, pt.y);
        maxX = Math.max(maxX, pt.x);
        maxY = Math.max(maxY, pt.y);
      });
    });

    // Fallback if the board is completely empty
    if (nodes.length === 0 && strokes.length === 0) {
      minX = 100;
      minY = 100;
      maxX = 1200;
      maxY = 800;
    }

    // Add extra margins/padding around elements (80px)
    minX = Math.max(0, minX - 80);
    minY = Math.max(0, minY - 80);
    maxX = Math.min(5000, maxX + 80);
    maxY = Math.min(4000, maxY + 80);

    const exportWidth = maxX - minX;
    const exportHeight = maxY - minY;

    setExportMessage('Đang kết xuất bản vẽ vector (High-DPI)...');

    // Force scale to 1 temporarily so html2canvas extracts actual full resolution
    setTransform({ x: 0, y: 0, scale: 1 });

    // Wait a brief frame for React to repaint at scale=1
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const exportCanvas = await html2canvas(workspaceEl, {
            x: minX,
            y: minY,
            width: exportWidth,
            height: exportHeight,
            scale: 2, // 2x high resolution supersampling
            backgroundColor: '#fafaf9', // Stone 50 background
            useCORS: true,
            logging: false
          });
          resolve(exportCanvas);
        } catch (error) {
          console.error('Export rendering failed:', error);
          resolve(null);
        } finally {
          // Restore user's workspace zoom/pan factor
          setTransform(savedTransform);
          setExporting(false);
          setExportMessage('');
        }
      }, 250);
    });
  };

  // 10. EXPORT PNG IMAGE
  const handleExportPNG = async () => {
    try {
      const canvas = await captureWhiteboardWorkspace();
      if (!canvas) {
        alert('Lỗi xuất bản vẽ. Vui lòng thử lại!');
        return;
      }
      
      const link = document.createElement('a');
      link.download = `whiteboard-export-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error(e);
      alert('Không thể xuất file PNG.');
    }
  };

  // 11. EXPORT PDF DOCUMENT
  const handleExportPDF = async () => {
    try {
      const canvas = await captureWhiteboardWorkspace();
      if (!canvas) {
        alert('Lỗi xuất bản vẽ. Vui lòng thử lại!');
        return;
      }

      const imgData = canvas.toDataURL('image/png');
      const w = canvas.width;
      const h = canvas.height;

      // Determine PDF page orientation based on workspace layout
      const orientation = w > h ? 'l' : 'p';
      
      // Initialize landscape or portrait jsPDF with exact pixel bounds
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [w / 2, h / 2] // downscale 2x resolution to match normal density bounds
      });

      pdf.addImage(imgData, 'PNG', 0, 0, w / 2, h / 2);
      pdf.save(`whiteboard-workflow-${Date.now()}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Không thể xuất file PDF.');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-screen h-screen p-4 gap-4 bg-stone-900 overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR CONTROLS PANEL */}
      <Sidebar
        mode={mode}
        setMode={setMode}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushWidth={brushWidth}
        setBrushWidth={setBrushWidth}
        onAddNode={handleAddNode}
        onClearDrawing={handleClearDrawing}
        onClearAll={handleClearAll}
        onLoadTemplate={handleLoadTemplate}
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* RIGHT MAIN BOARD CANVAS */}
      <div className="flex-1 flex flex-col gap-3 h-full relative">
        {/* Sub-header status notification in Neo-Brutalism */}
        <div className="bg-white border-4 border-black p-3.5 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-black uppercase tracking-wider">
              {mode === 'select' && '🖱️ Chế độ KÉO THẢ: Drag note để xếp vị trí. Lăn chuột để Zoom.'}
              {mode === 'draw' && '✏️ Chế độ BÚT VẼ: Click và rê chuột trực tiếp lên bảng để vẽ tự do.'}
              {mode === 'erase' && '🧽 Chế độ TẨY NÉT: Rê chuột qua các nét vẽ tự do để xóa nét.'}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-[10px] font-bold bg-neutral-200 border border-black px-1.5 py-0.5 rounded-xs">
              Mẹo: Shift + Rê chuột để Pan bảng vẽ bất cứ lúc nào!
            </span>
          </div>
        </div>

        {/* Dynamic canvas element */}
        <Canvas
          nodes={nodes}
          connections={connections}
          strokes={strokes}
          mode={mode}
          brushColor={brushColor}
          brushWidth={brushWidth}
          transform={transform}
          setTransform={setTransform}
          onUpdateNodes={setNodes}
          onUpdateConnections={setConnections}
          onUpdateStrokes={setStrokes}
          onEditNode={(node) => setEditingNode(node)}
        />
      </div>

      {/* NODE CONFIGURATION & EDIT MODAL */}
      <NodeEditor
        node={editingNode}
        isOpen={editingNode !== null}
        onClose={() => setEditingNode(null)}
        onSave={handleSaveNode}
        onDelete={handleDeleteNode}
      />

      {/* HELP INSTRUCTIONS MODAL */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* EXPORT OVERLAY LOADER */}
      {exporting && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-yellow-100 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center max-w-sm w-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-black mx-auto mb-4" />
            <h3 className="font-black text-lg uppercase tracking-tight text-black mb-1">Đang xuất bản...</h3>
            <p className="text-xs font-bold text-neutral-600 uppercase">{exportMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
