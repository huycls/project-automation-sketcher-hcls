import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, Settings, Sparkles } from 'lucide-react';
import { WorkflowNode, NodeType } from '../types';

interface NodeEditorProps {
  node: WorkflowNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedNode: WorkflowNode) => void;
  onDelete: (nodeId: string) => void;
}

const COLOR_PRESETS = [
  { name: 'Vàng Sáng', value: '#fef08a', text: 'text-black' },     // Neon Yellow
  { name: 'Hồng Sặc Sỡ', value: '#fbcfe8', text: 'text-black' },   // Neon Pink
  { name: 'Xanh Neon', value: '#bbf7d0', text: 'text-black' },     // Lime/Mint Green
  { name: 'Xanh Trời', value: '#bfdbfe', text: 'text-black' },     // Sky Blue
  { name: 'Cam Đậm', value: '#ffedd5', text: 'text-black' },       // Light Orange
  { name: 'Tím Oải Hương', value: '#e9d5ff', text: 'text-black' }, // Lavender
  { name: 'Trắng Sạch', value: '#ffffff', text: 'text-black' },    // Pure White
  { name: 'Cam Cháy', value: '#fed7aa', text: 'text-black' },      // Warm Orange
  { name: 'Xanh Ngọc', value: '#99f6e4', text: 'text-black' },     // Teal
];

const NODE_TYPES: { type: NodeType; label: string; icon: string }[] = [
  { type: 'note', label: 'Thẻ ghi chú (Sticky Note)', icon: '📝' },
  { type: 'process', label: 'Khối Xử lý (Process)', icon: '⚙️' },
  { type: 'decision', label: 'Khối Quyết định (Decision)', icon: '❓' },
  { type: 'io', label: 'Khối Vào/Ra (Input/Output)', icon: '📥' },
  { type: 'start_end', label: 'Khối Khởi đầu/Kết thúc', icon: '🏁' },
];

export default function NodeEditor({ node, isOpen, onClose, onSave, onDelete }: NodeEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState<NodeType>('note');
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(120);

  useEffect(() => {
    if (node) {
      setTitle(node.title);
      setContent(node.content);
      setColor(node.color);
      setType(node.type);
      setWidth(node.width);
      setHeight(node.height);
    }
  }, [node, isOpen]);

  if (!isOpen || !node) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...node,
      title: title.trim() || 'Không có tiêu đề',
      content: content.trim(),
      color,
      type,
      width: Math.max(120, Math.min(600, width)),
      height: Math.max(80, Math.min(500, height)),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black"
        id="node-editor-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-yellow-300 px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {NODE_TYPES.find(t => t.type === type)?.icon || '📝'}
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight">Cấu hình ghi chú</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 border-2 border-black bg-rose-400 hover:bg-rose-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Node Type */}
          <div>
            <label className="block text-xs font-black uppercase mb-1 tracking-wider">Hình dạng khối</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NodeType)}
              className="w-full p-2.5 border-3 border-black bg-yellow-50 font-bold focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {NODE_TYPES.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-black uppercase mb-1 tracking-wider">Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
              className="w-full p-2.5 border-3 border-black bg-yellow-50 font-bold focus:outline-none focus:bg-white placeholder-neutral-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              maxLength={60}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-black uppercase mb-1 tracking-wider">Nội dung ghi chú</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung chi tiết..."
              rows={3}
              className="w-full p-2.5 border-3 border-black bg-yellow-50 font-semibold focus:outline-none focus:bg-white placeholder-neutral-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          {/* Size inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase mb-1 tracking-wider">Chiều rộng (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 120)}
                min={120}
                max={600}
                className="w-full p-2 border-3 border-black bg-yellow-50 font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-1 tracking-wider">Chiều cao (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 80)}
                min={80}
                max={500}
                className="w-full p-2 border-3 border-black bg-yellow-50 font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-black uppercase mb-1.5 tracking-wider">Màu sắc Neo-Brutalist</label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setColor(p.value)}
                  className={`h-10 border-3 border-black transition-all flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5`}
                  style={{ backgroundColor: p.value }}
                  title={p.name}
                >
                  {color === p.value && (
                    <Check className="w-5 h-5 text-black stroke-[3px]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t-4 border-black pt-4 mt-4">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
                  onDelete(node.id);
                  onClose();
                }
              }}
              className="px-4 py-2 border-3 border-black bg-rose-400 hover:bg-rose-500 font-extrabold flex items-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
            >
              <Trash2 className="w-4 h-4" />
              Xóa bỏ
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border-3 border-black bg-neutral-200 hover:bg-neutral-300 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 border-3 border-black bg-emerald-400 hover:bg-emerald-500 font-extrabold flex items-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
              >
                <Check className="w-4 h-4" />
                Lưu lại
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
