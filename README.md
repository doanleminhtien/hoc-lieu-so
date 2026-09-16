<div align="center">

# 📚 HỆ THỐNG QUẢN LÝ HỌC LIỆU SỐ (NTTU EDUHUB)
### *Digital Learning Resources Management System*

![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React_18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Build_Tool-Vite_5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS_3.x-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<p align="center">
  Nền tảng quản lý, số hóa, thẩm định và chia sẻ tài nguyên giáo trình, bài giảng, đề thi dành cho môi trường Đại học.
</p>

</div>

---

## 📑 MỤC LỤC
1. [Giới Thiệu Dự Án](#-giới-thiệu-dự-án)
2. [Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
3. [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
4. [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
5. [Mô Hình Dữ Liệu (Database Schema)](#-mô-hình-dữ-liệu-database-schema)
6. [Hướng Dẫn Cài Đặt & Chạy Hệ Thống](#-hướng-dẫn-cài-đặt--chạy-hệ-thống)
7. [Tài Liệu API (API Documentation)](#-tài-liệu-api-api-documentation)
8. [Hệ Thống Nhật Ký Bảo Mật (Audit Logs)](#-hệ-thống-nhật-ký-bảo-mật-audit-logs)
9. [Đóng Góp & Phát Triển](#-đóng-góp--phát-triển)

---

## 📖 GIỚI THIỆU DỰ ÁN

**Nền tảng Học Liệu Số** là giải pháp phần mềm quản lý kho tài nguyên giáo dục số hóa dành cho Giảng viên và Sinh viên. Hệ thống giải quyết các vấn đề lưu trữ, phân loại, tìm kiếm và kiểm duyệt giáo trình, đề thi, bài giảng video/doc/pdf một cách tập trung, bảo mật và tiện lợi.

### 🎯 Mục tiêu đề tài:
- **Số hóa tài liệu:** Xây dựng kho lưu trữ tài liệu chuẩn hóa theo Khoa/Ngành/Danh mục.
- **Phân quyền chặt chẽ:** Kiểm soát quyền hạn rõ ràng giữa Quản trị viên (Admin), Giảng viên (Lecturer), và Sinh viên (Student).
- **Quy trình kiểm duyệt:** Giúp Ban giám hiệu / Khoa thẩm định chất lượng học liệu trước khi xuất bản công khai.
- **Minh bạch hệ thống:** Theo dõi toàn bộ lịch sử thao tác quan trọng thông qua hệ thống **Audit Logs** tự động chuyển đổi sang Tiếng Việt.

---

## ✨ TÍNH NĂNG NỔI BẬT

### 👑 1. Dành cho Quản trị viên (Admin)
- **Bảng điều khiển KPIs (Dashboard Analytics):**
  - Thống kê tổng số lượng Người dùng, Học liệu, Lượt xem (Views), Lượt tải (Downloads).
  - Biểu đồ phân bổ học liệu theo từng Danh mục / Khoa.
  - Danh sách TOP 5 học liệu phổ biến nhất hệ thống.
- **Quản lý Tài khoản (User Management):**
  - Tìm kiếm, lọc danh sách người dùng theo tên, email, mã số sinh viên/giảng viên.
  - Tạo mới tài khoản Giảng viên / Sinh viên hàng loạt.
  - Khóa (Block) / Mở khóa (Unblock) tài khoản người dùng trực tiếp.
  - Cập nhật thông tin cá nhân và vai trò.
- **Duyệt & Kiểm duyệt Học liệu:**
  - Phê duyệt (`APPROVED`) hoặc Từ chối (`REJECTED`) yêu cầu đăng tải học liệu từ Giảng viên kèm lý do.
- **Nhật ký Hệ thống (Audit Logs):**
  - Lưu lịch sử đăng nhập, tạo/sửa người dùng, duyệt/khóa học liệu.
  - Tự động mã hóa và dịch chi tiết kỹ thuật JSON sang ngữ cảnh Tiếng Việt tự nhiên.

### 👨‍🏫 2. Dành cho Giảng viên (Lecturer)
- **Đăng tải Học liệu:** Tải lên tài liệu mới (PDF, Word, PowerPoint, Video...) kèm thông tin mô tả, danh mục, từ khóa.
- **Quản lý Kho học liệu cá nhân:**
  - Theo dõi trạng thái kiểm duyệt (`PENDING_APPROVAL`, `PUBLISHED`, `REJECTED`).
  - Chỉnh sửa thông tin học liệu hoặc xóa học liệu cá nhân.
- **Thống kê tương tác:** Xem tổng lượt truy cập và lượt tải về tài liệu của chính mình.

### 🧑‍🎓 3. Dành cho Sinh viên (Student) & Khách
- **Tra cứu & Tìm kiếm thông minh:**
  - Tìm kiếm theo từ khóa, lọc theo Khoa, Ngành học, loại học liệu.
- **Đọc & Tải xuống:** Đọc trực tiếp trên web hoặc tải file về máy.
- **Lưu Yêu thích (Favorites):** Thêm vào danh sách tài liệu yêu thích để tra cứu lại nhanh chóng.
- **Lịch sử học tập:** Theo dõi danh sách tài liệu đã xem / đã tải.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### **Backend Stack**
* **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+) - Hiệu năng cao, tự động sinh tài liệu Swagger UI.
* **Database ORM:** [SQLAlchemy](https://www.sqlalchemy.org/) - Quản lý CSDL quan hệ.
* **Validation & Schemas:** [Pydantic v2](https://docs.pydantic.dev/) - Xác thực dữ liệu đầu vào/đầu ra.
* **Authentication:** JWT (JSON Web Tokens) & Passlib (Bcrypt) mã hóa mật khẩu.
* **Database:** SQLite (Mặc định cho Dev) / MySQL hoặc PostgreSQL (Production).

### **Frontend Stack**
* **Core:** [React 18](https://react.dev/) + [TypeScript / JavaScript].
* **Build Tool:** [Vite](https://vitejs.dev/) - Tốc độ build và Hot Reload siêu nhanh.
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Giao diện hiện đại, Responsive.
* **Icons & Components:** Lucide React Icons, Axios Client.

---

## 📂 CẤU TRÚC THƯ MỤC

```text
hoc-lieu-so/
├── backend/                        # Mã nguồn Backend (FastAPI)
│   ├── app/
│   │   ├── api/                    # API Endpoints
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/      # admin.py, auth.py, materials.py, users.py...
│   │   │   │   └── deps.py         # Dependencies (Authentication, Role checks)
│   │   ├── core/                   # Cấu hình hệ thống (database.py, security.py, config.py)
│   │   ├── models/                 # SQLAlchemy ORM Models (user.py, material.py, audit_log.py...)
│   │   └── schemas/                # Pydantic Schemas (Request/Response)
│   ├── main.py                     # Entry point chính khởi chạy FastAPI
│   └── requirements.txt            # Thư viện Python phụ thuộc
│
├── frontend/                       # Mã nguồn Frontend (React + Vite)
│   ├── src/
│   │   ├── assets/                 # Hình ảnh, icons, logo
│   │   ├── components/             # Components UI tái sử dụng (Header, Sidebar, Table, Modal...)
│   │   ├── pages/                  # Các trang (Dashboard, UserManagement, AuditLogs, Login...)
│   │   ├── services/               # Cấu hình Axios API Calls
│   │   ├── App.jsx                 # Route chính
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── .gitignore                      # Cấu hình bỏ qua file rác khi đẩy code
├── CachchayWEB.md                  # Hướng dẫn khởi chạy ứng dụng nhanh
└── README.md                       # Tài liệu giới thiệu dự án
