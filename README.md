# 🎓 NTTU EduHub — Hệ Thống Quản Lý Học Liệu Số

![NTTU EduHub Banner](https://img.shields.io/badge/NTTU_EduHub-v3.0-blue?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Build_Tool-Vite-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss)

> **Sản phẩm thuộc đề tài Đồ án tốt nghiệp Đại học NTTU (Trường Đại học Nguyễn Tất Thành)**  
> Nền tảng quản trị, thẩm định và chia sẻ tài nguyên giáo trình, bài giảng, tài liệu học tập số hóa dành cho Giảng viên và Sinh viên.

---

## 📌 Tính Năng Chính

### 🛡️ 1. Phân Quyền Nâng Cao (RBAC)
* **Quản trị viên (Admin):**
  * Quản lý & phân quyền tài khoản (Admin, Giảng viên, Sinh viên).
  * Khóa / Mở khóa tài khoản người dùng.
  * Thẩm định và duyệt học liệu đăng tải.
  * Bảng điều khiển (Dashboard KPIs) giám sát lượt xem, tải xuống, danh mục học liệu.
  * Nhật ký bảo mật (Audit Logs) tự động ghi lại lịch sử thao tác hệ thống bằng văn bản trực quan.
* **Giảng viên (Lecturer):**
  * Đăng tải học liệu (Giáo trình, Bài giảng, Đề thi...).
  * Quản lý và chỉnh sửa danh sách học liệu cá nhân.
  * Theo dõi trạng thái duyệt học liệu.
* **Sinh viên (Student):**
  * Tìm kiếm, tra cứu học liệu số theo từ khóa, khoa/ngành, danh mục.
  * Đọc trực tuyến và tải xuống tài liệu.
  * Yêu thích và lưu trữ học liệu cá nhân.

---

## 🏗️ Cấu Trúc Dự Án

```text
hoc-lieu-so/
├── backend/                # Mã nguồn FastAPI (RESTful API)
│   ├── app/
│   │   ├── api/            # API Endpoints (v1: auth, admin, materials, users...)
│   │   ├── core/           # Config, Security, Database connection
│   │   ├── models/         # SQLAlchemy Models (User, Role, Material, AuditLog...)
│   │   └── schemas/        # Pydantic Schemas (Request/Response models)
│   └── main.py             # File khởi chạy ứng dụng FastAPI
├── frontend/               # Mã nguồn React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/     # UI Components dùng chung (Header, Sidebar, Modals...)
│   │   ├── pages/          # Trang ứng dụng (Dashboard, Login, MaterialDetail...)
│   │   └── services/       # Cấu hình Axios call API
│   └── package.json
├── CachchayWEB.md          # Hướng dẫn chi tiết vận hành hệ thống
└── README.md               # Tài liệu giới thiệu dự án
