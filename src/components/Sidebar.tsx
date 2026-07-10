import React from 'react';
import { 
  MousePointer, Paintbrush, Eraser, Trash2, Download, 
  HelpCircle, Plus, LayoutGrid, FileText, Settings, 
  Sparkles, Undo2, RotateCcw
} from 'lucide-react';
import { BoardMode, NodeType } from '../types';
import { templates } from '../templates';

interface SidebarProps {
  mode: BoardMode;
  setMode: (mode: BoardMode) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushWidth: number;
  setBrushWidth: (width: number) => void;
  onAddNode: (type: NodeType) => void;
  onClearDrawing: () => void;
  onClearAll: () => void;
  onLoadTemplate: (index: number) => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onOpenHelp: () => void;
}

const BRUSH_COLORS = [
  { name: 'Đen Tuyển', value: '#000000' },
  { name: 'Đỏ Đậm', value: '#ef4444' },
  { name: 'Xanh Lá', value: '#22c55e' },
  { name: 'Xanh Dương', value: '#3b82f6' },
  { name: 'Cam Cháy', value: '#f97316' },
  { name: 'Hồng Sen', value: '#ec4899' },
  { name: 'Tím Đậm', value: '#a855f7' },
  { name: 'Vàng Chanh', value: '#eab308' },
];

const BRUSH_WIDTHS = [2, 4, 8, 12, 16];

export default function Sidebar({
  mode,
  setMode,
  brushColor,
  setBrushColor,
  brushWidth,
  setBrushWidth,
  onAddNode,
  onClearDrawing,
  onClearAll,
  onLoadTemplate,
  onExportPNG,
  onExportPDF,
  onOpenHelp
}: SidebarProps) {
  return (
    <div 
      id="sidebar-container"
      className="w-full lg:w-80 bg-orange-50 border-4 border-black p-5 flex flex-col gap-5 overflow-y-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:h-[calc(100vh-2rem)] select-none z-10"
    >
      {/* App Header branding */}
      <div className="border-b-4 border-black pb-4">
        <div className="flex items-center gap-2 bg-yellow-300 p-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg] mb-2">
          <Sparkles className="w-6 h-6 text-black fill-black" />
          <h1 className="text-xl font-black uppercase tracking-tight text-black">
            BRUTALFLOW
          </h1>
        </div>
        <p className="text-xs font-bold text-neutral-700 italic">
          Bảng ghi chú & Sơ đồ vẽ tay Neo-Brutalist
        </p>
      </div>

      {/* 1. CHỌN CÔNG CỤ (TOOL MODES) */}
      <div className="space-y-2">
        <h2 className="text-sm font-black uppercase tracking-wider text-black">
          🛠️ Công cụ vẽ & thao tác
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMode('select')}
            className={`py-2 px-1 border-2 border-black font-extrabold flex flex-col items-center justify-center gap-1 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
              mode === 'select'
                ? 'bg-yellow-300 translate-x-[1px] translate-y-[1px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-yellow-100 hover:-translate-y-0.5 active:translate-y-0.5'
            }`}
            title="Kéo thả nốt, pan, zoom bảng vẽ"
          >
            <MousePointer className="w-5 h-5" />
            <span>Kéo thả</span>
          </button>

          <button
            onClick={() => setMode('draw')}
            className={`py-2 px-1 border-2 border-black font-extrabold flex flex-col items-center justify-center gap-1 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
              mode === 'draw'
                ? 'bg-yellow-300 translate-x-[1px] translate-y-[1px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-yellow-100 hover:-translate-y-0.5 active:translate-y-0.5'
            }`}
            title="Vẽ tự do lên màn hình"
          >
            <Paintbrush className="w-5 h-5" />
            <span>Bút vẽ</span>
          </button>

          <button
            onClick={() => setMode('erase')}
            className={`py-2 px-1 border-2 border-black font-extrabold flex flex-col items-center justify-center gap-1 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
              mode === 'erase'
                ? 'bg-yellow-300 translate-x-[1px] translate-y-[1px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-yellow-100 hover:-translate-y-0.5 active:translate-y-0.5'
            }`}
            title="Tẩy các nét vẽ tự do"
          >
            <Eraser className="w-5 h-5" />
            <span>Tẩy nét</span>
          </button>
        </div>
      </div>

      {/* 2. CHỌN MÀU VẼ VÀ CỠ CỌ (Khi ở chế độ Draw) */}
      {(mode === 'draw' || mode === 'erase') && (
        <div className="border-2 border-black p-3 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
          {mode === 'draw' && (
            <div>
              <span className="text-xs font-black uppercase block mb-1">Màu nét vẽ:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {BRUSH_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setBrushColor(c.value)}
                    className={`h-6 w-full border-2 border-black transition-transform ${
                      brushColor === c.value ? 'scale-110 ring-2 ring-black' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-xs font-black uppercase block mb-1">
              {mode === 'erase' ? 'Cỡ tẩy:' : 'Cỡ nét vẽ:'} {brushWidth}px
            </span>
            <div className="flex justify-between items-center gap-1">
              {BRUSH_WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => setBrushWidth(w)}
                  className={`border-2 border-black font-black text-xs h-7 w-7 flex items-center justify-center transition-all ${
                    brushWidth === w ? 'bg-black text-white' : 'bg-neutral-100 hover:bg-neutral-200'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onClearDrawing}
            className="w-full py-1.5 border-2 border-black bg-rose-200 hover:bg-rose-300 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            Xóa hết nét vẽ
          </button>
        </div>
      )}

      {/* 3. THÊM GHI CHÚ & KHỐI LOGIC */}
      <div className="space-y-2">
        <h2 className="text-sm font-black uppercase tracking-wider text-black">
          ➕ Thêm Khối & Thẻ Note
        </h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onAddNode('note')}
            className="w-full py-2 px-3 border-2 border-black bg-emerald-200 hover:bg-emerald-300 font-extrabold text-xs flex items-center gap-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
          >
            <span className="text-base bg-white border border-black p-0.5 leading-none">📝</span>
            Thêm Sticky Note (Thẻ ghi nhớ)
          </button>

          <button
            onClick={() => onAddNode('process')}
            className="w-full py-2 px-3 border-2 border-black bg-sky-200 hover:bg-sky-300 font-extrabold text-xs flex items-center gap-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
          >
            <span className="text-base bg-white border border-black p-0.5 leading-none">⚙️</span>
            Khối Xử lý (Process Rect)
          </button>

          <button
            onClick={() => onAddNode('decision')}
            className="w-full py-2 px-3 border-2 border-black bg-amber-200 hover:bg-amber-300 font-extrabold text-xs flex items-center gap-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
          >
            <span className="text-base bg-white border border-black p-0.5 leading-none">❓</span>
            Khối Quyết định (Decision)
          </button>

          <button
            onClick={() => onAddNode('io')}
            className="w-full py-2 px-3 border-2 border-black bg-orange-200 hover:bg-orange-300 font-extrabold text-xs flex items-center gap-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
          >
            <span className="text-base bg-white border border-black p-0.5 leading-none">📥</span>
            Khối Dữ liệu (Input/Output)
          </button>

          <button
            onClick={() => onAddNode('start_end')}
            className="w-full py-2 px-3 border-2 border-black bg-purple-200 hover:bg-purple-300 font-extrabold text-xs flex items-center gap-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
          >
            <span className="text-base bg-white border border-black p-0.5 leading-none">🏁</span>
            Bắt đầu / Kết thúc (Start/End)
          </button>
        </div>
      </div>

      {/* 4. CHỌN MẪU BẢN VẼ (TEMPLATES) */}
      <div className="space-y-2">
        <h2 className="text-sm font-black uppercase tracking-wider text-black">
          📋 Bản mẫu quy trình
        </h2>
        <div className="flex flex-col gap-1.5 bg-white border-2 border-black p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {templates.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (window.confirm(`Bạn muốn tải bản mẫu "${tmpl.name}"? Thao tác này sẽ ghi đè thiết kế hiện tại.`)) {
                  onLoadTemplate(idx);
                }
              }}
              className="w-full text-left p-1.5 border border-black bg-neutral-50 hover:bg-yellow-100 font-bold text-xs flex flex-col gap-0.5 transition-colors"
            >
              <span className="text-indigo-600 font-black">★ {tmpl.name}</span>
              <span className="text-[10px] text-neutral-500 font-medium line-clamp-1">{tmpl.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. XUẤT FILE ĐỊNH DẠNG (EXPORT) */}
      <div className="space-y-2 mt-auto">
        <h2 className="text-sm font-black uppercase tracking-wider text-black">
          📥 Xuất bản thiết kế
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportPNG}
            className="py-2.5 px-2 border-2 border-black bg-pink-300 hover:bg-pink-400 font-black text-xs flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            title="Xuất file ảnh định dạng PNG chất lượng"
          >
            <Download className="w-4 h-4 stroke-[3px]" />
            Ảnh PNG
          </button>

          <button
            onClick={onExportPDF}
            className="py-2.5 px-2 border-2 border-black bg-teal-300 hover:bg-teal-400 font-black text-xs flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            title="Xuất tài liệu PDF định dạng vector"
          >
            <FileText className="w-4 h-4 stroke-[3px]" />
            File PDF
          </button>
        </div>
      </div>

      {/* 6. HỖ TRỢ & XOÁ SẠCH */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-black/30">
        <button
          onClick={onOpenHelp}
          className="py-2 px-2 border-2 border-black bg-blue-300 hover:bg-blue-400 font-black text-xs flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
        >
          <HelpCircle className="w-4 h-4" />
          Hướng dẫn
        </button>

        <button
          onClick={() => {
            if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ nội dung bảng (bao gồm nét vẽ, thẻ ghi chú, các mối liên kết)?')) {
              onClearAll();
            }
          }}
          className="py-2 px-2 border-2 border-black bg-rose-400 hover:bg-rose-500 font-black text-xs flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Xóa bảng
        </button>
      </div>
    </div>
  );
}
