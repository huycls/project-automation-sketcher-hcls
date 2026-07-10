import React, { useRef, useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Maximize2, ZoomIn, ZoomOut, Move, 
  HelpCircle, Check, X, MousePointer, Paintbrush
} from 'lucide-react';
import { 
  WorkflowNode, Connection, Point, DrawingStroke, 
  BoardMode, CanvasTransform, NodeType 
} from '../types';

interface CanvasProps {
  nodes: WorkflowNode[];
  connections: Connection[];
  strokes: DrawingStroke[];
  mode: BoardMode;
  brushColor: string;
  brushWidth: number;
  transform: CanvasTransform;
  setTransform: (t: CanvasTransform) => void;
  onUpdateNodes: (nodes: WorkflowNode[]) => void;
  onUpdateConnections: (connections: Connection[]) => void;
  onUpdateStrokes: (strokes: DrawingStroke[]) => void;
  onEditNode: (node: WorkflowNode) => void;
}

// Fixed dimensions for the giant infinite whiteboard coordinate system
const BOARD_WIDTH = 5000;
const BOARD_HEIGHT = 4000;

export default function Canvas({
  nodes,
  connections,
  strokes,
  mode,
  brushColor,
  brushWidth,
  transform,
  setTransform,
  onUpdateNodes,
  onUpdateConnections,
  onUpdateStrokes,
  onEditNode
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction States
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  
  // Connection dragging state
  const [activePortDrag, setActivePortDrag] = useState<{
    fromId: string;
    startPoint: Point;
    currentPoint: Point;
  } | null>(null);

  // Paint Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<Point[]>([]);

  // State to edit connection labels
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);
  const [connectionLabelInput, setConnectionLabelInput] = useState('');

  // Draw existing and active strokes on the background canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // Set drawing styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw all completed strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 1) return;
      
      ctx.beginPath();
      ctx.lineWidth = stroke.width;
      
      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    // Draw current active drawing stroke
    if (isDrawing && currentStrokePoints.length > 0) {
      ctx.beginPath();
      ctx.lineWidth = brushWidth;
      
      if (mode === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = brushColor;
      }

      ctx.moveTo(currentStrokePoints[0].x, currentStrokePoints[0].y);
      for (let i = 1; i < currentStrokePoints.length; i++) {
        ctx.lineTo(currentStrokePoints[i].x, currentStrokePoints[i].y);
      }
      ctx.stroke();
    }

    // Reset composite operation to default
    ctx.globalCompositeOperation = 'source-over';

  }, [strokes, currentStrokePoints, isDrawing, brushColor, brushWidth, mode]);

  // Center view on load if it's the first render
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      setTransform({
        x: (containerWidth - BOARD_WIDTH * 0.4) / 2,
        y: 80,
        scale: 0.8
      });
    }
  }, []);

  // Convert Screen pixel coordinates (clientX, clientY) to Board coordinates
  const getBoardCoords = (clientX: number, clientY: number): Point => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - transform.x) / transform.scale;
    const y = (clientY - rect.top - transform.y) / transform.scale;
    return { x, y };
  };

  // ZOOM HANDLERS
  const handleZoom = (factor: number, clientX?: number, clientY?: number) => {
    let zoomCenterX = 0;
    let zoomCenterY = 0;

    if (clientX !== undefined && clientY !== undefined && containerRef.current) {
      // Zoom on cursor position
      const rect = containerRef.current.getBoundingClientRect();
      zoomCenterX = clientX - rect.left;
      zoomCenterY = clientY - rect.top;
    } else if (containerRef.current) {
      // Zoom on container center
      zoomCenterX = containerRef.current.clientWidth / 2;
      zoomCenterY = containerRef.current.clientHeight / 2;
    }

    const newScale = Math.max(0.15, Math.min(3.0, transform.scale * factor));
    
    // Adjust transform x and y so the point remains fixed
    const dx = zoomCenterX - transform.x;
    const dy = zoomCenterY - transform.y;
    
    setTransform({
      x: zoomCenterX - dx * (newScale / transform.scale),
      y: zoomCenterY - dy * (newScale / transform.scale),
      scale: newScale
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    handleZoom(factor, e.clientX, e.clientY);
  };

  // MOUSE DOWN HANDLER (Handles draw, pan, and dragging)
  const handleMouseDown = (e: React.MouseEvent) => {
    const isMiddleButton = e.button === 1;
    const isLeftButton = e.button === 0;
    
    // Spacebar or middle button can always pan
    const forcePan = isMiddleButton || (isLeftButton && e.shiftKey);

    if (forcePan || (mode === 'select' && !draggedNodeId && !activePortDrag)) {
      // Start panning the whole board
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
      if (e.cancelable) e.preventDefault();
      return;
    }

    if ((mode === 'draw' || mode === 'erase') && isLeftButton) {
      // Start painting strokes
      setIsDrawing(true);
      const boardPoint = getBoardCoords(e.clientX, e.clientY);
      setCurrentStrokePoints([boardPoint]);
      if (e.cancelable) e.preventDefault();
    }
  };

  // MOUSE MOVE HANDLER
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setTransform({
        ...transform,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (isDrawing) {
      const boardPoint = getBoardCoords(e.clientX, e.clientY);
      // Limit frequency to make straight paths less jagged
      setCurrentStrokePoints((prev) => [...prev, boardPoint]);
      return;
    }

    if (draggedNodeId) {
      const boardPoint = getBoardCoords(e.clientX, e.clientY);
      // Snap to grid of 10px for alignment satisfaction
      const gridX = Math.round((boardPoint.x - dragOffset.x) / 10) * 10;
      const gridY = Math.round((boardPoint.y - dragOffset.y) / 10) * 10;

      onUpdateNodes(
        nodes.map((n) => (n.id === draggedNodeId ? { ...n, x: gridX, y: gridY } : n))
      );
      return;
    }

    if (activePortDrag) {
      const boardPoint = getBoardCoords(e.clientX, e.clientY);
      setActivePortDrag({
        ...activePortDrag,
        currentPoint: boardPoint
      });
    }
  };

  // MOUSE UP HANDLER
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing) {
      setIsDrawing(false);
      if (currentStrokePoints.length > 1) {
        const newStroke: DrawingStroke = {
          id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          points: currentStrokePoints,
          color: brushColor,
          width: brushWidth,
          isEraser: mode === 'erase'
        };
        onUpdateStrokes([...strokes, newStroke]);
      }
      setCurrentStrokePoints([]);
      return;
    }

    if (draggedNodeId) {
      setDraggedNodeId(null);
      return;
    }

    if (activePortDrag) {
      // Check if mouse is released over another node's input handle area
      // Find the target node near the release point
      const releasePoint = getBoardCoords(e.clientX, e.clientY);
      let targetNodeId: string | null = null;

      // Scan all nodes (excluding the originator) to check if we are close to their left port
      for (const node of nodes) {
        if (node.id === activePortDrag.fromId) continue;
        
        // Input port is at (node.x, node.y + node.height / 2)
        const inputPortX = node.x;
        const inputPortY = node.y + node.height / 2;

        const distance = Math.hypot(releasePoint.x - inputPortX, releasePoint.y - inputPortY);
        // Accept snap area of 45px
        if (distance < 50) {
          targetNodeId = node.id;
          break;
        }
      }

      if (targetNodeId) {
        // Create new connection!
        const connectionExists = connections.some(
          (c) => c.fromId === activePortDrag.fromId && c.toId === targetNodeId
        );

        if (!connectionExists) {
          const newConnection: Connection = {
            id: `conn-${Date.now()}`,
            fromId: activePortDrag.fromId,
            toId: targetNodeId!,
            label: ''
          };
          onUpdateConnections([...connections, newConnection]);
        }
      }

      setActivePortDrag(null);
    }
  };

  // Click on a node port handles
  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string, side: 'in' | 'out', node: WorkflowNode) => {
    e.stopPropagation();
    if (mode !== 'select') return;

    const startPoint = side === 'out' 
      ? { x: node.x + node.width, y: node.y + node.height / 2 }
      : { x: node.x, y: node.y + node.height / 2 };

    setActivePortDrag({
      fromId: nodeId,
      startPoint,
      currentPoint: startPoint
    });
  };

  const deleteConnection = (id: string) => {
    onUpdateConnections(connections.filter((c) => c.id !== id));
    setEditingConnectionId(null);
  };

  const handleSaveConnectionLabel = (id: string) => {
    onUpdateConnections(
      connections.map((c) => (c.id === id ? { ...c, label: connectionLabelInput } : c))
    );
    setEditingConnectionId(null);
  };

  // Helper to calculate connection line paths (Cubic Bezier curve like Figma/Miro)
  const getConnectionPath = (fromNode: WorkflowNode, toNode: WorkflowNode) => {
    const startX = fromNode.x + fromNode.width;
    const startY = fromNode.y + fromNode.height / 2;
    const endX = toNode.x;
    const endY = toNode.y + toNode.height / 2;

    const controlOffset = Math.max(100, Math.abs(endX - startX) * 0.5);

    return {
      d: `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`,
      midX: (startX + endX) / 2,
      midY: (startY + endY) / 2
    };
  };

  // Helper to get specialized styling classes for Neo-Brutalist nodes
  const getNodeShapeStyles = (type: NodeType, color: string) => {
    const base = "absolute border-4 border-black text-black select-none font-bold shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between";
    
    switch (type) {
      case 'note':
        // Standard high-contrast sticky note with "tape" header bar
        return {
          cardClass: `${base} rounded-none p-4`,
          customHeader: (
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-20 h-5 bg-yellow-100/80 border-2 border-black rotate-[-2deg] z-10" />
          )
        };
      case 'process':
        // Perfect rectangle
        return {
          cardClass: `${base} rounded-none p-4`,
          customHeader: null
        };
      case 'decision':
        // Diamond shaped logic check. We achieve this by keeping outer rect relative and using css rotate on inner styles,
        // or simple diamond styling. We'll use a centered text diamond layout.
        return {
          cardClass: `${base} rounded-none p-5 text-center items-center justify-center`,
          customHeader: (
            <div className="absolute inset-0 border-4 border-black -rotate-45 -z-10 bg-inherit" 
                 style={{ backgroundColor: color }} />
          )
        };
      case 'io':
        // Input Output Parallelogram
        return {
          cardClass: `${base} rounded-none p-4 skew-x-[-10deg]`,
          innerClass: "skew-x-[10deg]",
          customHeader: null
        };
      case 'start_end':
        // Pill capsule shape
        return {
          cardClass: `${base} rounded-full px-6 py-4 text-center justify-center items-center`,
          customHeader: null
        };
      default:
        return {
          cardClass: `${base} rounded-none p-4`,
          customHeader: null
        };
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`relative flex-1 h-[calc(100vh-2rem)] bg-neutral-100 overflow-hidden border-4 border-black select-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
        mode === 'select' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle, #a3a3a3 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: `${transform.x}px ${transform.y}px`
      }}
    >
      {/* WHITEBOARD CORE CONTAINER (PAN/ZOOM SENSITIVE) */}
      <div 
        id="whiteboard-workspace"
        className="absolute origin-top-left"
        style={{
          width: BOARD_WIDTH,
          height: BOARD_HEIGHT,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        {/* A. CANVAS PAINT DRAWING LAYER (Behind all elements) */}
        <canvas
          ref={canvasRef}
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          className="absolute inset-0 pointer-events-none"
        />

        {/* B. SVG CONNECTION PATHS LAYER */}
        <svg 
          className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible"
        >
          <defs>
            {/* Neo-Brutalist thick pointer arrowhead */}
            <marker
              id="brutal-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="black" stroke="black" strokeWidth="1" />
            </marker>
          </defs>

          {/* Render Active dragging connection link */}
          {activePortDrag && (
            <path
              d={`M ${activePortDrag.startPoint.x} ${activePortDrag.startPoint.y} C ${
                activePortDrag.startPoint.x + 100
              } ${activePortDrag.startPoint.y}, ${activePortDrag.currentPoint.x - 100} ${
                activePortDrag.currentPoint.y
              }, ${activePortDrag.currentPoint.x} ${activePortDrag.currentPoint.y}`}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="5"
              strokeDasharray="8 6"
              markerEnd="url(#brutal-arrow)"
            />
          )}

          {/* Render Persistent saved connections */}
          {connections.map((conn) => {
            const fromNode = nodes.find((n) => n.id === conn.fromId);
            const toNode = nodes.find((n) => n.id === conn.toId);
            
            if (!fromNode || !toNode) return null;

            const pathInfo = getConnectionPath(fromNode, toNode);

            return (
              <g key={conn.id} className="pointer-events-auto group">
                {/* Thick background border path for clickable feedback */}
                <path
                  d={pathInfo.d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="15"
                  className="cursor-pointer"
                  onClick={() => {
                    setEditingConnectionId(conn.id);
                    setConnectionLabelInput(conn.label || '');
                  }}
                />
                {/* Actual black connection line */}
                <path
                  d={pathInfo.d}
                  fill="none"
                  stroke="black"
                  strokeWidth="4"
                  markerEnd="url(#brutal-arrow)"
                  className="transition-all cursor-pointer group-hover:stroke-indigo-600 group-hover:stroke-[5px]"
                  onClick={() => {
                    setEditingConnectionId(conn.id);
                    setConnectionLabelInput(conn.label || '');
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* C. CONNECTION LABELS & EDITS LAYER */}
        {connections.map((conn) => {
          const fromNode = nodes.find((n) => n.id === conn.fromId);
          const toNode = nodes.find((n) => n.id === conn.toId);
          
          if (!fromNode || !toNode) return null;
          const pathInfo = getConnectionPath(fromNode, toNode);

          return (
            <div
              key={`label-${conn.id}`}
              className="absolute pointer-events-auto z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: pathInfo.midX, top: pathInfo.midY }}
            >
              {editingConnectionId === conn.id ? (
                /* Inline label editor */
                <div className="bg-yellow-100 border-3 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                  <input
                    type="text"
                    value={connectionLabelInput}
                    onChange={(e) => setConnectionLabelInput(e.target.value)}
                    placeholder="Mũi tên..."
                    className="w-24 px-1 py-0.5 font-bold text-xs border-2 border-black focus:outline-none bg-white"
                    autoFocus
                    maxLength={20}
                  />
                  <button
                    onClick={() => handleSaveConnectionLabel(conn.id)}
                    className="p-1 bg-green-300 hover:bg-green-400 border-2 border-black"
                  >
                    <Check className="w-3.5 h-3.5 text-black" />
                  </button>
                  <button
                    onClick={() => deleteConnection(conn.id)}
                    className="p-1 bg-rose-400 hover:bg-rose-500 border-2 border-black"
                    title="Xóa liên kết"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-black" />
                  </button>
                  <button
                    onClick={() => setEditingConnectionId(null)}
                    className="p-1 bg-neutral-300 hover:bg-neutral-400 border-2 border-black"
                  >
                    <X className="w-3.5 h-3.5 text-black" />
                  </button>
                </div>
              ) : (
                /* Static flow label (Clickable) */
                (conn.label || editingConnectionId === null) && (
                  <div 
                    onClick={() => {
                      setEditingConnectionId(conn.id);
                      setConnectionLabelInput(conn.label || '');
                    }}
                    className="px-2.5 py-1 bg-white border-2 border-black font-extrabold text-[11px] uppercase tracking-wide cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-100 transition-colors"
                  >
                    {conn.label || <span className="text-neutral-400 text-[9px] lowercase italic">đặt tên...</span>}
                  </div>
                )
              )}
            </div>
          );
        })}

        {/* D. WORKFLOW NODES CONTAINER */}
        {nodes.map((node) => {
          const { cardClass, innerClass, customHeader } = getNodeShapeStyles(node.type, node.color);
          const isNote = node.type === 'note';
          const isDecision = node.type === 'decision';

          return (
            <div
              key={node.id}
              className={cardClass}
              style={{
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
                backgroundColor: node.color,
                zIndex: draggedNodeId === node.id ? 40 : 10,
              }}
              onDoubleClick={() => onEditNode(node)}
            >
              {/* Optional Brutalist tape or decor overlay */}
              {customHeader}

              {/* Node Drag Handle bar (For everything except Decision diamonds) */}
              <div
                className={`flex items-center justify-between border-b-2 border-black/30 pb-1 mb-1.5 cursor-grab active:cursor-grabbing select-none ${
                  isDecision ? 'hidden' : ''
                }`}
                onMouseDown={(e) => {
                  if (e.button !== 0 || mode !== 'select') return;
                  e.stopPropagation();
                  setDraggedNodeId(node.id);
                  const boardPoint = getBoardCoords(e.clientX, e.clientY);
                  setDragOffset({
                    x: boardPoint.x - node.x,
                    y: boardPoint.y - node.y
                  });
                }}
              >
                <div className="flex items-center gap-1 text-[10px] tracking-wider uppercase font-black text-neutral-600">
                  <Move className="w-3 h-3 text-black" />
                  <span>{node.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditNode(node);
                    }}
                    className="p-0.5 hover:bg-black/10 rounded-sm border border-transparent hover:border-black/20"
                    title="Cấu hình nốt"
                  >
                    <Edit className="w-3 h-3 text-black" />
                  </button>
                </div>
              </div>

              {/* Decision Diamond content drag surface */}
              {isDecision && (
                <div
                  className="absolute inset-0 cursor-grab active:cursor-grabbing z-0 rounded-none"
                  onMouseDown={(e) => {
                    if (e.button !== 0 || mode !== 'select') return;
                    e.stopPropagation();
                    setDraggedNodeId(node.id);
                    const boardPoint = getBoardCoords(e.clientX, e.clientY);
                    setDragOffset({
                      x: boardPoint.x - node.x,
                      y: boardPoint.y - node.y
                    });
                  }}
                />
              )}

              {/* Central text content */}
              <div 
                className={`flex-1 flex flex-col min-h-0 overflow-hidden relative z-10 ${innerClass || ''}`}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onEditNode(node);
                }}
              >
                <h4 className="text-sm font-black uppercase tracking-tight text-black truncate mb-0.5">
                  {node.title}
                </h4>
                <p className="text-xs font-semibold text-neutral-800 leading-tight overflow-y-auto break-words whitespace-pre-wrap pr-1 flex-1">
                  {node.content}
                </p>
              </div>

              {/* VISUAL PORTS (Left and Right connection circles) */}
              {mode === 'select' && (
                <>
                  {/* Left Connection Port (Input) */}
                  <div
                    onMouseDown={(e) => handlePortMouseDown(e, node.id, 'in', node)}
                    className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-[3px] border-black rounded-full cursor-alias flex items-center justify-center hover:bg-indigo-300 transition-colors z-20 group"
                    title="Cổng Nhận (In)"
                  >
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>

                  {/* Right Connection Port (Output) */}
                  <div
                    onMouseDown={(e) => handlePortMouseDown(e, node.id, 'out', node)}
                    className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-[3px] border-black rounded-full cursor-alias flex items-center justify-center hover:bg-indigo-300 transition-colors z-20"
                    title="Kéo từ đây để kết nối với nốt khác"
                  >
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* FLOATING ACTION TOOLBAR (Canvas Utilities) */}
      <div 
        id="canvas-toolbar"
        className="absolute bottom-5 right-5 flex items-center gap-2 bg-yellow-50 border-3 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-30"
      >
        <button
          onClick={() => handleZoom(1.2)}
          className="p-2 border-2 border-black bg-white hover:bg-yellow-200 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5"
          title="Phóng to"
        >
          <ZoomIn className="w-4 h-4 text-black font-extrabold" />
        </button>

        <button
          onClick={() => handleZoom(0.8)}
          className="p-2 border-2 border-black bg-white hover:bg-yellow-200 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-4 h-4 text-black font-extrabold" />
        </button>

        <button
          onClick={() => {
            if (containerRef.current) {
              const containerWidth = containerRef.current.clientWidth;
              const containerHeight = containerRef.current.clientHeight;
              setTransform({
                x: (containerWidth - BOARD_WIDTH * 0.4) / 2,
                y: 80,
                scale: 0.8
              });
            }
          }}
          className="p-2 border-2 border-black bg-white hover:bg-yellow-200 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5"
          title="Khôi phục góc nhìn mặc định"
        >
          <Maximize2 className="w-4 h-4 text-black font-extrabold" />
        </button>

        <div className="h-6 w-[2px] bg-black/30 mx-1" />

        <div className="text-xs font-black uppercase px-1">
          Kính: {Math.round(transform.scale * 100)}%
        </div>
      </div>
    </div>
  );
}
