import { BoardTemplate } from './types';

export const templates: BoardTemplate[] = [
  {
    name: "Quy trình Phê duyệt (Approval Flowchart)",
    description: "Một sơ đồ logic mẫu minh họa luồng phê duyệt ý tưởng hoặc sản phẩm.",
    nodes: [
      {
        id: "start-1",
        type: "start_end",
        title: "BẮT ĐẦU",
        content: "Khởi động ý tưởng dự án mới",
        x: 100,
        y: 250,
        width: 140,
        height: 80,
        color: "#22c55e" // Green
      },
      {
        id: "proc-1",
        type: "process",
        title: "Thiết kế Bản nháp",
        content: "Tạo tài liệu thiết kế và wireframe chi tiết",
        x: 300,
        y: 240,
        width: 180,
        height: 100,
        color: "#3b82f6" // Blue
      },
      {
        id: "dec-1",
        type: "decision",
        title: "Đạt chuẩn?",
        content: "Kiểm tra chất lượng & độ khả thi",
        x: 540,
        y: 215,
        width: 150,
        height: 150,
        color: "#eab308" // Yellow
      },
      {
        id: "proc-yes",
        type: "process",
        title: "Triển khai Code",
        content: "Lập trình các tính năng theo kế hoạch",
        x: 750,
        y: 120,
        width: 180,
        height: 100,
        color: "#ec4899" // Pink
      },
      {
        id: "proc-no",
        type: "process",
        title: "Sửa đổi Bản nháp",
        content: "Cập nhật tài liệu dựa trên phản hồi của QC",
        x: 750,
        y: 360,
        width: 180,
        height: 100,
        color: "#f97316" // Orange
      },
      {
        id: "end-1",
        type: "start_end",
        title: "KẾT THÚC",
        content: "Phát hành bản thử nghiệm Alpha",
        x: 1000,
        y: 250,
        width: 140,
        height: 80,
        color: "#a855f7" // Purple
      },
      {
        id: "note-tips",
        type: "note",
        title: "💡 Mẹo nhỏ",
        content: "Double-click vào bất kỳ ô nào để sửa nội dung. Kéo thả các hình tròn ở rìa trái/phải để nối quy trình!",
        x: 450,
        y: 20,
        width: 250,
        height: 140,
        color: "#fed7aa" // Light Orange
      }
    ],
    connections: [
      { id: "c1", fromId: "start-1", toId: "proc-1", label: "Gửi nháp" },
      { id: "c2", fromId: "proc-1", toId: "dec-1" },
      { id: "c3", fromId: "dec-1", toId: "proc-yes", label: "ĐẠT (YES)" },
      { id: "c4", fromId: "dec-1", toId: "proc-no", label: "KHÔNG ĐẠT (NO)" },
      { id: "c5", fromId: "proc-yes", toId: "end-1", label: "Hoàn thành" },
      { id: "c6", fromId: "proc-no", toId: "proc-1", label: "Làm lại" }
    ]
  },
  {
    name: "Agile Kanban Brainstorming",
    description: "Một không gian làm việc Kanban dạng Sticky notes để kéo thả phân loại công việc.",
    nodes: [
      {
        id: "col-todo",
        type: "io",
        title: "📌 VIỆC CẦN LÀM (TO-DO)",
        content: "Ý tưởng cần được phân tích và chuẩn bị triển khai.",
        x: 100,
        y: 100,
        width: 280,
        height: 100,
        color: "#fb7185" // Rose pink
      },
      {
        id: "col-doing",
        type: "io",
        title: "⚡ ĐANG THỰC HIỆN",
        content: "Những đầu việc đang được lập trình, thiết kế.",
        x: 440,
        y: 100,
        width: 280,
        height: 100,
        color: "#60a5fa" // Light Blue
      },
      {
        id: "col-done",
        type: "io",
        title: "✅ HOÀN THÀNH",
        content: "Công việc đã bàn giao & kiểm thử thành công.",
        x: 780,
        y: 100,
        width: 280,
        height: 100,
        color: "#34d399" // Light Green
      },
      {
        id: "note-todo-1",
        type: "note",
        title: "Giao diện Neo-Brutalist",
        content: "Thiết kế nút bấm có viền dày và đổ bóng vuông cá tính.",
        x: 120,
        y: 230,
        width: 240,
        height: 130,
        color: "#fef08a" // Yellow note
      },
      {
        id: "note-todo-2",
        type: "note",
        title: "Xử lý Canvas Vẽ",
        content: "Xây dựng nét cọ vẽ bằng Canvas 2D để user phác thảo bằng chuột hoặc bút.",
        x: 120,
        y: 400,
        width: 240,
        height: 130,
        color: "#c084fc" // Purple note
      },
      {
        id: "note-doing-1",
        type: "note",
        title: "Xuất PDF & Ảnh",
        content: "Sử dụng html2canvas và jsPDF để chuyển đổi toàn bộ DOM thành file tải về.",
        x: 460,
        y: 230,
        width: 240,
        height: 130,
        color: "#f9a8d4" // Pink note
      },
      {
        id: "note-done-1",
        type: "note",
        title: "Cấu trúc TypeScript",
        content: "Định nghĩa interfaces trong src/types.ts và lưu trữ local state tự động.",
        x: 800,
        y: 230,
        width: 240,
        height: 130,
        color: "#86efac" // Green note
      }
    ],
    connections: []
  },
  {
    name: "Bản đồ Tư duy Sản phẩm (Mindmap)",
    description: "Cấu trúc sơ đồ tư duy tập trung, phát triển các tính năng cốt lõi.",
    nodes: [
      {
        id: "center-node",
        type: "process",
        title: "ỨNG DỤNG BRUTALFLOW 🚀",
        content: "Giải pháp ghi chú & vẽ sơ đồ độc đáo phong cách Brutalism.",
        x: 450,
        y: 260,
        width: 280,
        height: 120,
        color: "#ec4899" // Hot pink
      },
      {
        id: "node-branch-1",
        type: "note",
        title: "🎨 Vẽ tự do (Paint)",
        content: "Dùng chuột/bút vẽ trực tiếp lên nền bảng như Paint thực thụ.",
        x: 150,
        y: 120,
        width: 220,
        height: 110,
        color: "#3b82f6" // Cyan
      },
      {
        id: "node-branch-2",
        type: "note",
        title: "⚡ Kéo thả khối (Flow)",
        content: "Xếp các khối Logic, kết nối bằng mũi tên thông minh.",
        x: 780,
        y: 120,
        width: 220,
        height: 110,
        color: "#eab308" // Yellow
      },
      {
        id: "node-branch-3",
        type: "note",
        title: "📄 Xuất Bản (Export)",
        content: "Tải file PDF báo cáo hoặc ảnh PNG chất lượng cao để chia sẻ.",
        x: 150,
        y: 430,
        width: 220,
        height: 110,
        color: "#22c55e" // Green
      },
      {
        id: "node-branch-4",
        type: "note",
        title: "🔥 Phong cách Neo-Brutalist",
        content: "Viền đen 4px cực đậm, màu tương phản rực rỡ cá tính.",
        x: 780,
        y: 430,
        width: 220,
        height: 110,
        color: "#f97316" // Orange
      }
    ],
    connections: [
      { id: "m1", fromId: "center-node", toId: "node-branch-1" },
      { id: "m2", fromId: "center-node", toId: "node-branch-2" },
      { id: "m3", fromId: "center-node", toId: "node-branch-3" },
      { id: "m4", fromId: "center-node", toId: "node-branch-4" }
    ]
  }
];
