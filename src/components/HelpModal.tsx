import React from 'react';
import { X, MousePointer, Paintbrush, ArrowUpRight, Copy, Save, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      {/* Neo-Brutalist Card Container */}
      <div 
        id="help-modal-card"
        className="w-full max-w-2xl bg-amber-50 border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-8 h-8 text-indigo-600 fill-indigo-200" />
            <h2 className="text-2xl font-black tracking-tight text-black">
              HƯỚNG DẪN SỬ DỤNG BRUTALFLOW
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 border-2 border-black bg-rose-400 hover:bg-rose-500 hover:-translate-y-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform"
            aria-label="Đóng"
          >
            <X className="w-6 h-6 text-black font-bold" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
          {/* Column 1 */}
          <div className="space-y-4">
            <div className="border-2 border-black p-4 bg-yellow-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-extrabold flex items-center gap-2 mb-2">
                <MousePointer className="w-5 h-5" /> 1. KÉO THẢ & DI CHUYỂN
              </h3>
              <p className="text-sm font-medium">
                Sử dụng công cụ <strong>Di chuyển (Select)</strong> để:
              </p>
              <ul className="list-disc pl-5 text-xs font-semibold mt-1 space-y-1">
                <li>Kéo thả bất cứ nốt hay khối logic nào để thay đổi vị trí.</li>
                <li><strong>Pan (Cuộn bảng):</strong> Nhấn giữ chuột giữa hoặc kéo nền trống để di chuyển bảng vẽ.</li>
                <li><strong>Zoom (Phóng to/Thu nhỏ):</strong> Lăn bánh xe chuột để phóng to thu nhỏ.</li>
              </ul>
            </div>

            <div className="border-2 border-black p-4 bg-teal-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-extrabold flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-5 h-5" /> 2. KẾT NỐI KHỐI LOGIC
              </h3>
              <p className="text-sm font-medium">
                Nối các khối lại để tạo quy trình workflow:
              </p>
              <ul className="list-disc pl-5 text-xs font-semibold mt-1 space-y-1">
                <li>Mỗi khối có 2 nút tròn: <strong>Trái (Đầu vào)</strong> và <strong>Phải (Đầu ra)</strong>.</li>
                <li>Rê chuột vào nút tròn bên phải (Out), kéo đường dây nối sang nút tròn bên trái (In) của khối khác để tạo liên kết!</li>
                <li>Nhấp chuột vào đường dây để xóa liên kết hoặc đổi nhãn mũi tên.</li>
              </ul>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <div className="border-2 border-black p-4 bg-lime-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-extrabold flex items-center gap-2 mb-2">
                <Paintbrush className="w-5 h-5" /> 3. VẼ TỰ DO (PAINT LAYER)
              </h3>
              <p className="text-sm font-medium">
                Phác thảo trực tiếp lên bảng vẽ:
              </p>
              <ul className="list-disc pl-5 text-xs font-semibold mt-1 space-y-1">
                <li>Chuyển sang công cụ <strong>Bút vẽ (Draw)</strong> để vẽ tự do.</li>
                <li>Điều chỉnh màu sắc bút và độ dày nét ở thanh điều khiển.</li>
                <li>Sử dụng công cụ <strong>Tẩy (Eraser)</strong> để xóa các nét vẽ không vừa ý.</li>
              </ul>
            </div>

            <div className="border-2 border-black p-4 bg-pink-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-extrabold flex items-center gap-2 mb-2">
                <Save className="w-5 h-5" /> 4. SỬA ĐỔI & XUẤT FILE
              </h3>
              <p className="text-sm font-medium">
                Cập nhật nội dung và tải về thiết kế:
              </p>
              <ul className="list-disc pl-5 text-xs font-semibold mt-1 space-y-1">
                <li><strong>Sửa đổi:</strong> Nhấp đúp (Double-click) trực tiếp vào ô chữ của ghi chú để đổi tiêu đề và nội dung.</li>
                <li><strong>Xuất Bản:</strong> Chọn xuất định dạng <strong>Ảnh PNG</strong> hoặc <strong>Tài liệu PDF</strong> ở menu trái để lưu trữ/chia sẻ.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border-3 border-black bg-black text-white hover:bg-neutral-800 font-black tracking-wider hover:-translate-x-0.5 hover:-translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(251,191,36,1)] active:translate-x-0 active:translate-y-0 transition-transform"
          >
            ĐÃ HIỂU! BẮT ĐẦU VẼ
          </button>
        </div>
      </div>
    </div>
  );
}
