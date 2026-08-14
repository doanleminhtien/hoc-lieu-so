# BÁO CÁO THUYẾT MINH ĐỒ ÁN TỐT NGHIỆP ĐẠI HỌC

## ĐỀ TÀI: PHÂN TÍCH, THIẾT KẾ VÀ PHÁT TRIỂN HỆ THỐNG QUẢN LÝ HỌC LIỆU SỐ
### (DIGITAL MATERIAL MANAGEMENT SYSTEM)

**Ngành**: Công nghệ Thông tin  
**Chuyên ngành**: Công nghệ Phần mềm  
**Nhóm Sinh viên Thực hiện**:
1. Nguyễn Mai Minh Đạt - MSSV: 2200000873
2. Nguyễn Anh Khoa - MSSV: 2200004825
3. Phạm Nguyễn Nhật Sơn - MSSV: 2200006700
4. Phan Đức Anh - MSSV: 2200004289

**Giảng viên Hướng dẫn**: TS. Nguyễn Văn Hải  

---

# LỜI MỞ ĐẦU

## 1.1. Lý do chọn đề tài
Trong thời đại chuyển đổi số giáo dục đại học, việc quản lý và chia sẻ học liệu số (bao gồm giáo trình, bài giảng, đề thi, bài tập và tài liệu tham khảo) đóng vai trò then chốt trong nâng cao chất lượng đào tạo. Tuy nhiên, khảo sát thực tế tại nhiều cơ sở đào tạo cho thấy công tác quản lý học liệu vẫn còn tồn tại các bất cập lớn:

1. **Phân tán và thiếu tập trung**: Học liệu bị lưu trữ phân tán qua các kênh cá nhân (Google Drive, Zalo, USB), thiếu cơ sở dữ liệu kho học liệu quy chuẩn của trường.
2. **Khó kiểm soát bản quyền và phân quyền truy cập**: Không có cơ chế phân quyền rõ ràng giữa tài liệu công khai toàn trường, tài liệu chỉ dành riêng cho sinh viên đăng ký học phần, hoặc tài liệu bảo mật nội bộ khoa.
3. **Thiếu quy trình kiểm duyệt chất lượng**: Giảng viên đăng tải học liệu chưa đi qua quy trình thẩm định nội dung từ Quản trị viên/Hội đồng đào tạo.
4. **Nguy cơ rò rỉ dữ liệu qua liên kết trực tiếp**: Các hệ thống cũ thường mount thư mục lưu trữ tĩnh (`/static`), tạo điều kiện cho người dùng không có quyền truy cập trực tiếp file mà không qua kiểm tra xác thực.
5. **Thiếu nhật ký lưu vết (Audit Logging)**: Không thể thống kê chính xác số lượt xem, lượt tải thực tế và lưu vết khi xảy ra sự cố an toàn thông tin.

Xuất phát từ các bài toán thực tế trên, nhóm đã lựa chọn đề tài: **"Phân tích, thiết kế và phát triển Hệ thống Quản lý Học liệu Số"** nhằm xây dựng một giải pháp phần mềm toàn diện, đáp ứng quy chuẩn đào tạo đại học, bảo mật cao và tối ưu trải nghiệm người dùng.

---

# MỤC TIÊU VÀ PHẠM VI NGHIÊN CỨU

## 1. Mục tiêu đề tài
* **Về mặt lý thuyết**: Nghiên cứu và áp dụng kiến trúc phân tầng (Clean Layered Architecture), mô hình xác thực stateless JWT, quy trình phân quyền RBAC, State Machine quản lý phê duyệt và bảo mật luồng stream tập tin.
* **Về mặt thực tiễn**: Phát triển hoàn chỉnh ứng dụng web quản lý học liệu số với FastAPI (Backend) và React 19 (Frontend), đáp ứng đầy đủ nghiệp vụ 3 vai trò: Admin, Giảng viên và Sinh viên.

## 2. Phạm vi nghiên cứu

### Trong phạm vi (In-Scope)
* Hệ thống xác thực JWT (Login, Register, Refresh Token, Bcrypt password hashing).
* Phân quyền người dùng theo 3 Role (`ADMIN`, `LECTURER`, `STUDENT`).
* Phân quyền học liệu theo 4 cấp độ (`PUBLIC`, `AUTHENTICATED`, `ROLE_BASED`, `PRIVATE`).
* Quy trình phê duyệt học liệu 5 trạng thái (`DRAFT` ➔ `PENDING_APPROVAL` ➔ `APPROVED` / `REJECTED` ➔ `PUBLISHED`).
* Lớp trừu tượng lưu trữ file (Storage Abstraction Layer: Local Storage & Cloudinary).
* Tải file an toàn qua luồng Stream Guard (`GET /materials/{id}/download`).
* Tìm kiếm từ khóa, lọc theo Danh mục/Khoa/Môn học và phân trang.
* Nhật ký xem/tải tài liệu, Lưu học liệu yêu thích và Security Audit Logs.
* Bảng điều khiển Dashboard thống kê KPI bằng SQL Aggregation.

### Ngoài phạm vi (Out-of-Scope)
* Ứng dụng di động native (Mobile Application iOS/Android).
* Trích xuất văn bản tự động bằng OCR và Tìm kiếm ngữ nghĩa AI (AI Semantic Search).
* Trình chỉnh sửa tài liệu trực tuyến (Online Document Editor).

---

# CHƯƠNG 1: TỔNG QUAN DỰ ÁN VÀ CƠ SỞ LÝ THUYẾT

## 1.1. Khảo sát và So sánh Giải pháp Tương tự

| Tiêu chí So sánh | Moodle | Google Classroom | Hệ thống Đề xuất |
| :--- | :--- | :--- | :--- |
| **Mục đích chính** | Hệ quản trị học tập (LMS) | Quản lý lớp học trực tuyến | Kho quản lý học liệu số tập trung |
| **Tìm kiếm học liệu** | Phức tạp, phụ thuộc khóa học | Giới hạn trong lớp học | Tìm kiếm nâng cao + Chỉ mục FTS |
| **Quy trình Phê duyệt** | Cần cài thêm Plugin | Không hỗ trợ | State Machine tích hợp sẵn |
| **Cấp độ Phân quyền** | Phân quyền theo Course | Theo Lớp học | 4 cấp (`PUBLIC`, `AUTH`, `ROLE`, `PRIVATE`) |
| **Bảo mật Tải file** | Check session LMS | Quản lý qua Google Drive | Stream Guard kiểm tra 9 bước |
| **Audit Logs & KPIs** | Log thô, khó tra cứu | Thống kê cơ bản | SQL Aggregation + Visual Recharts |

## 1.2. Công nghệ Lựa chọn và Lý do Kỹ thuật

### 1.2.1 Backend: Python 3.14 & FastAPI 0.110
* **Lý do lựa chọn**: FastAPI cung cấp hiệu năng cao nhờ kiến trúc Asynchronous (ASGI), tự động sinh tài liệu chuẩn OpenAPI Swagger (`/docs`), và kiểm soát kiểu dữ liệu nghiêm ngặt qua Pydantic v2.

### 1.2.2 Frontend: React 19, TypeScript & Vite 5.4
* **Lý do lựa chọn**: React 19 tối ưu hóa việc render UI với Virtual DOM, TypeScript giúp phát hiện lỗi kiểu ở compile-time, và Vite mang lại tốc độ build vượt trội (4.75s).

### 1.2.3 Cơ sở Dữ liệu & ORM: SQLAlchemy 2.0 & SQLite/PostgreSQL
* **Lý do lựa chọn**: SQLAlchemy 2.0 cung cấp cơ chế Data Mapper và SQL Abstraction mạnh mẽ, cho phép chạy SQLite trên môi trường Development và chuyển đổi sang PostgreSQL trên môi trường Production mà không cần sửa đổi mã nguồn.

### 1.2.4 Xác thực & Mã hóa: JWT & Bcrypt
* **Lý do lựa chọn**: JWT cung cấp cơ chế xác thực Stateless phù hợp kiến trúc REST API. Mật khẩu được mã hóa an toàn bằng thuật toán Bcrypt với Work Factor 12.

---

# CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 2.1. Phân tích Yêu cầu Chức năng (Functional Requirements)

* **FR-01 (Xác thực)**: Người dùng có thể đăng nhập, đăng ký và lấy thông tin cá nhân.
* **FR-02 (Phân quyền RBAC)**: Hệ thống phân định 3 vai trò Admin, Giảng viên và Sinh viên.
* **FR-03 (Tạo bài giảng)**: Giảng viên có thể đăng tải tài liệu ở trạng thái `DRAFT`.
* **FR-04 (Quy trình Duyệt)**: Admin có quyền Phê duyệt (`APPROVED`) hoặc Từ chối (`REJECTED` có kèm lý do).
* **FR-05 (Bảo mật Tải file)**: Hệ thống kiểm tra ủy quyền trước khi cho phép stream file binary.
* **FR-06 (Tìm kiếm & Lọc)**: Cho phép tìm kiếm theo từ khóa `title`, `subject`, `course_code` và lọc theo Danh mục.
* **FR-07 (Dashboard KPIs)**: Hiển thị các chỉ số thống kê tổng quan được tổng hợp tại Backend.

## 2.2. Đặc tả Tác nhân (Actors)
1. **Guest**: Người dùng vô danh, chỉ có quyền xem và tải học liệu `PUBLIC`.
2. **Student**: Sinh viên, có quyền xem/tải học liệu `PUBLIC` & `AUTHENTICATED`, lưu học liệu yêu thích.
3. **Lecturer**: Giảng viên, có quyền tạo bài giảng, gửi duyệt học liệu và xem thống kê tài liệu cá nhân.
4. **Admin**: Quản trị viên, có quyền duyệt/từ chối học liệu, quản lý tài khoản người dùng, xem Audit Logs.

---

## 2.3. Sơ đồ Use Case

[SCREENSHOT CẦN CHỤP: General_UseCase_Diagram]

### Đặc tả Use Case: Phê duyệt Học liệu (Admin Approve Material)
* **Actor**: Admin
* **Tiền điều kiện**: Admin đã đăng nhập, Học liệu đang ở trạng thái `PENDING_APPROVAL`.
* **Luồng chính**:
  1. Admin mở danh sách chờ duyệt trên Admin Console.
  2. Admin nhấn nút "Phê duyệt".
  3. Hệ thống cập nhật `approval_status = 'PUBLISHED'` và ghi nhận `published_at`.
  4. Hệ thống tự động chèn 1 bản ghi vào bảng `notifications` để thông báo cho Giảng viên tác giả.
  5. Hệ thống ghi nhật ký `audit_logs` với action `MATERIAL_APPROVE`.

---

## 2.4. Thiết kế Cơ sở Dữ liệu (13 Bảng chuẩn 3NF)

### 2.4.1 Sơ đồ Quan hệ Thực thể (ERD Diagram)
Hệ thống gồm 13 bảng quan hệ: `roles`, `users`, `categories`, `materials`, `material_files`, `tags`, `material_tags`, `access_permissions`, `material_views`, `material_downloads`, `favorites`, `notifications`, `audit_logs`.

[SCREENSHOT CẦN CHỤP: ERD_Database_Diagram]

### 2.4.2 Từ điển Dữ liệu (Data Dictionary - Các bảng cốt lõi)

#### Bảng `users` (Quản lý Người dùng)
| Cột (Column) | Kiểu Dữ liệu | Trói buộc (Key/Null) | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto Increment | Khóa chính |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email học tập/công vụ |
| `hashed_password` | VARCHAR(255) | NOT NULL | Mật khẩu băm Bcrypt |
| `full_name` | VARCHAR(100) | NOT NULL | Họ và tên |
| `user_code` | VARCHAR(20) | UNIQUE, NULLABLE | MSSV hoặc Mã Giảng viên |
| `role_id` | INTEGER | FK (roles.id), NOT NULL | Vai trò người dùng |
| `is_blocked` | BOOLEAN | DEFAULT FALSE | Trạng thái khóa tài khoản |

#### Bảng `materials` (Quản lý Học liệu)
| Cột (Column) | Kiểu Dữ liệu | Trói buộc (Key/Null) | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto Increment | Khóa chính |
| `title` | VARCHAR(255) | NOT NULL, INDEX | Tiêu đề học liệu |
| `slug` | VARCHAR(280) | UNIQUE, NOT NULL | Slug URL |
| `subject` | VARCHAR(150) | NOT NULL, INDEX | Tên môn học |
| `course_code` | VARCHAR(20) | NULLABLE, INDEX | Mã học phần |
| `author_id` | INTEGER | FK (users.id), NOT NULL | Giảng viên tác giả |
| `category_id` | INTEGER | FK (categories.id), NOT NULL | Danh mục học liệu |
| `approval_status` | VARCHAR(25) | DEFAULT 'DRAFT' | Trạng thái duyệt |
| `access_level` | VARCHAR(20) | DEFAULT 'PUBLIC' | Cấp độ truy cập |
| `view_count` | INTEGER | DEFAULT 0 | Số lượt xem (Atomic counter) |
| `download_count` | INTEGER | DEFAULT 0 | Số lượt tải (Atomic counter) |

---

## 2.5. Kiến trúc Hệ thống và Luồng Dữ liệu (System Architecture)

```
[ Client Interface: React 19 + TypeScript + Tailwind CSS ]
                               │
                       HTTP / REST APIs (Axios)
                               ▼
[ FastAPI Gateway (CorsMiddleware, ExceptionHandler, OpenAPI Docs) ]
                               │
                       Dependency Injection
                               ▼
[ Security & Auth Guard (JWT Verify, Password Hash, RBAC Check) ]
                               │
                               ▼
[ Service Layer (AuthService, MaterialService, AnalyticsService) ]
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
 [ BaseStorageProvider ]             [ SQLAlchemy 2.0 ORM ]
  ├── LocalStorageProvider                     │
  └── CloudinaryStorageProvider                ▼
                                     [ Relational Database ]
                                    (SQLite / PostgreSQL)
```

---

# CHƯƠNG 3: TRIỂN KHAI ỨNG DỤNG VÀ KIỂM THỬ

## 3.1. Cấu trúc Mã nguồn Thực tế

### 3.1.1 Phân hệ Backend (`backend/`)
```
backend/
├── app/
│   ├── api/v1/
│   │   ├── deps.py               # Dependency Injection (Auth Guard & Roles)
│   │   └── endpoints/            # auth.py, categories.py, materials.py, admin.py
│   ├── core/                     # config.py, database.py, security.py, storage.py
│   ├── models/                   # models.py (13 SQLAlchemy Models)
│   ├── schemas/                  # schemas.py (Pydantic DTOs)
│   ├── services/                 # auth_service.py, material_service.py
│   └── main.py                   # FastAPI Application Entrypoint
├── seed.py                       # Script khởi tạo dữ liệu mẫu
├── test_system.py                # Bộ kiểm thử E2E tự động
└── requirements.txt
```

### 3.1.2 Phân hệ Frontend (`frontend/`)
```
frontend/
├── src/
│   ├── api/axiosClient.ts        # Axios Client + JWT Interceptors
│   ├── components/ui/            # Navbar, MaterialCard, Badge
│   ├── contexts/AuthContext.tsx  # Context xác thực & profile
│   ├── pages/                    # LandingPage, MaterialsPage, DetailPage, Dashboards
│   ├── routes/AppRoutes.tsx      # ProtectedRoute & Role Guards
│   └── types/index.ts            # TypeScript Models & Interfaces
├── package.json
└── vite.config.ts
```

---

## 3.2. Kết quả Kiểm thử Chi tiết (Testing Results)

Hệ thống đã trải qua đợt kiểm thử chất lượng toàn diện với **31 Test Cases** (gồm 24 Test Cases tự động qua `python test_system.py` và 7 Test Cases thủ công):

### 3.2.1 Bảng Tổng hợp Kết quả Kiểm thử (Test Execution Table)

| Test ID | Module | Nội dung Kiểm thử | Kết quả Kỳ vọng | Kết quả Thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-001** | Auth | Đăng nhập Admin hợp lệ | 200 OK + JWT Tokens | 200 OK + Tokens | **PASS** |
| **TC-AUTH-002** | Auth | Đăng nhập Lecturer hợp lệ | 200 OK + JWT Tokens | 200 OK + Tokens | **PASS** |
| **TC-AUTH-003** | Auth | Đăng nhập Student hợp lệ | 200 OK + JWT Tokens | 200 OK + Tokens | **PASS** |
| **TC-AUTH-004** | Auth | Đăng nhập với Mật khẩu sai | 401 Unauthorized | 401 Unauthorized | **PASS** |
| **TC-AUTH-005** | Auth | Đăng nhập Email không tồn tại | 401 Unauthorized | 401 Unauthorized | **PASS** |
| **TC-AUTH-006** | Auth | Đăng nhập User bị khóa | 403 Forbidden | 403 Forbidden | **PASS** |
| **TC-AUTH-007** | Auth | Lấy profile cá nhân (`/auth/me`)| 200 OK + User Data | 200 OK + Profile | **PASS** |
| **TC-RBAC-001** | RBAC | Student truy cập Admin Console | 403 Forbidden | 403 Forbidden | **PASS** |
| **TC-RBAC-002** | RBAC | Lecturer truy cập Admin Console | 403 Forbidden | 403 Forbidden | **PASS** |
| **TC-RBAC-003** | RBAC | Admin truy cập Admin Console | 200 OK + KPIs | 200 OK + KPIs | **PASS** |
| **TC-RBAC-004** | RBAC | Student cố tình Phê duyệt bài | 403 Forbidden | 403 Forbidden | **PASS** |
| **TC-RBAC-005** | RBAC | Lecturer cố tình Phê duyệt bài | 403 Forbidden | 403 Forbidden | **PASS** |
| **TC-RBAC-006** | RBAC | Admin Phê duyệt bài giảng | 200 OK | 200 OK | **PASS** |
| **TC-UPLOAD-001**| Upload | Upload bài giảng PDF hợp lệ | 200 OK (Status: DRAFT) | 200 OK (Status: DRAFT) | **PASS** |
| **TC-UPLOAD-002**| Upload | Upload file mã độc `.exe` | 400 Bad Request | 400 Bad Request | **PASS** |
| **TC-UPLOAD-003**| Security| Sanitization Path Traversal Filename | Storage Path = UUID4 | Storage Path = UUID4 | **PASS** |
| **TC-WF-001** | Workflow| Lecturer Nộp bài chờ duyệt | Status: PENDING_APPROVAL | Status: PENDING_APPROVAL | **PASS** |
| **TC-WF-002** | Workflow| Admin Từ chối không có lý do | 422 Unprocessable | 422 Unprocessable | **PASS** |
| **TC-WF-003** | Workflow| Admin Từ chối có lý do | Status: REJECTED | Status: REJECTED | **PASS** |
| **TC-WF-004** | Workflow| Sửa bài & Admin Phê duyệt | Status: PUBLISHED | Status: PUBLISHED | **PASS** |
| **TC-ACC-001** | Access | Student xem tài liệu PRIVATE | 403 Forbidden | 403 Forbidden | **PASS** |
| **TC-ACC-002** | Access | Guest tải file PRIVATE | 403 Forbidden | 403 Forbidden | **PASS** |
| **TC-ACC-003** | Download| Tải file PUBLIC qua Stream Guard | 200 OK + File binary | 200 OK + Stream File | **PASS** |
| **TC-ACC-004** | Security| Chặn truy cập file trực tiếp | Direct Access Blocked | Direct Access Blocked | **PASS** |
| **TC-SRCH-001** | Search | Tìm kiếm theo từ khóa 'Kiến trúc'| 200 OK + Matched items | 200 OK + Matched items | **PASS** |
| **TC-SRCH-002** | Search | Lọc theo Danh mục & Phân trang | 200 OK + Paginated items | 200 OK + Paginated items | **PASS** |
| **TC-FAV-001** | Favorite| Student Thêm vào Yêu thích | `is_favorite = True` | `is_favorite = True` | **PASS** |
| **TC-FAV-002** | Favorite| Student Bỏ Yêu thích | `is_favorite = False` | `is_favorite = False` | **PASS** |
| **TC-LOG-001** | History | Tự động ghi Log Lượt xem | Record in `material_views` | Record created | **PASS** |
| **TC-LOG-002** | History | Tự động ghi Log Lượt tải | Record in `material_downloads`| Record created | **PASS** |
| **TC-LOG-003** | Audit | Tự động ghi Security Audit Log | Record in `audit_logs` | Record created | **PASS** |

### 3.2.2 Tổng kết Thống kê Kiểm thử
* **Tổng số Test Cases**: **31** (24 Tự động + 7 Thủ công).
* **Số lượng Đạt (PASS)**: **31** Test Cases.
* **Số lượng Thất bại (FAIL)**: **0** Test Cases.
* **Tỷ lệ Đạt (Pass Rate)**: **100.0%**.

---

## 3.3. Danh Mục Hình Ảnh Minh Chứng Giao Diện (Screenshots Mapping)

1. [SCREENSHOT CẦN CHỤP: Landing_Page_Hero] - Trang chủ Kho học liệu số.
2. [SCREENSHOT CẦN CHỤP: Materials_Search_Page] - Giao diện Tìm kiếm & Lọc học liệu.
3. [SCREENSHOT CẦN CHỤP: Material_Detail_Page] - Giao diện Chi tiết học liệu & Tải file.
4. [SCREENSHOT CẦN CHỤP: Login_Register_Page] - Giao diện Đăng nhập & Đăng ký Sinh viên.
5. [SCREENSHOT CẦN CHỤP: Lecturer_Dashboard_Upload] - Form Upload học liệu cho Giảng viên.
6. [SCREENSHOT CẦN CHỤP: Admin_Dashboard_Console] - Admin Console & Phê duyệt bài giảng.
7. [SCREENSHOT CẦN CHỤP: Admin_User_Management] - Quản lý tài khoản & Khóa người dùng.
8. [SCREENSHOT CẦN CHỤP: Admin_Audit_Logs] - Nhật ký an toàn thông tin Audit Logs.
9. [SCREENSHOT CẦN CHỤP: Swagger_API_Documentation] - Tài liệu OpenAPI FastAPI Docs.

---

# CHƯƠNG 4: TỔNG KẾT VÀ BÀI HỌC KINH NGHIỆM

## 4.1. Kết quả Đạt được
1. **Kiến trúc phần mềm hoàn chỉnh**: Xây dựng thành công ứng dụng web theo mô hình Clean Layered Architecture kết hợp FastAPI và React 19.
2. **Cơ sở dữ liệu đạt chuẩn**: Thiết kế 13 bảng quan hệ chuẩn 3NF, đáp ứng đầy đủ yêu cầu lưu vết lượt xem/tải và nhật ký audit log.
3. **Bảo mật & Phân quyền khắt khe**: Triển khai xác thực JWT, mã hóa mật khẩu Bcrypt, phân quyền RBAC 3 vai trò và luồng Stream Download Guard ngăn chặn 100% việc truy cập file trực tiếp trái phép.
4. **Quy trình Phê duyệt chặt chẽ**: Triển khai State Machine phê duyệt học liệu 5 trạng thái có ghi nhận lý do từ chối.
5. **Được kiểm thử 100%**: Đạt tỷ lệ Pass Rate 100% trên bộ test tự động E2E 31 Test Cases.

## 4.2. Hạn chế Của Hệ Thống
* Môi trường phát triển hiện tại đang sử dụng SQLite local (cần cấu hình chuyển đổi chính thức sang PostgreSQL khi đưa lên server production Render/Supabase).
* Chưa tích hợp bộ nhớ đệm Redis cho lượt xem (View Counter) ở quy mô truy cập cực lớn.

## 4.3. Hướng Phát Triển Trong Tương Lai
1. **AI Semantic Search**: Tích hợp mô hình nhúng Vector (Vector Embeddings) cho phép tìm kiếm học liệu theo ý nghĩa câu hỏi thay vì chỉ tìm theo từ khóa chính xác.
2. **Recommendation Engine**: Hệ thống gợi ý bài giảng thông minh dựa trên lịch sử xem và môn học đang đăng ký của sinh viên.
3. **Trình xem tài liệu trực tuyến (Online PDF Viewer)**: Tích hợp Viewer xem trực tiếp tài liệu trên trình duyệt mà không cần tải về máy.

---

# TÀI LIỆU THAM KHẢO

1. **FastAPI Documentation** (2026). *Modern, fast (high-performance), web framework for Python*. Available at: `https://fastapi.tiangolo.com/`
2. **React Documentation** (2026). *React 19 – A JavaScript library for building user interfaces*. Available at: `https://react.dev/`
3. **SQLAlchemy 2.0 Documentation** (2026). *The Python SQL Toolkit and Object Relational Mapper*. Available at: `https://docs.sqlalchemy.org/`
4. **RFC 7519** (2015). *JSON Web Token (JWT)*. Internet Engineering Task Force (IETF).
5. **OWASP Top 10** (2021). *Open Web Application Security Project Guide to Web Security*.

---

# PHỤ LỤC: DANH SÁCH REST API ENDPOINTS

| HTTP Method | Endpoint Path | Mô tả Chức năng | Phân Quyền (Authorization) |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Đăng ký tài khoản Sinh viên | Public |
| `POST` | `/api/v1/auth/login` | Đăng nhập & Lấy JWT Token | Public |
| `POST` | `/api/v1/auth/refresh` | Làm mới Access Token | Public |
| `GET` | `/api/v1/auth/me` | Lấy thông tin cá nhân | Authenticated |
| `GET` | `/api/v1/categories` | Lấy danh sách danh mục học liệu | Public |
| `GET` | `/api/v1/materials` | Tìm kiếm & Lọc danh sách học liệu | Public / Authenticated |
| `POST` | `/api/v1/materials` | Tạo học liệu mới (State: DRAFT) | Lecturer / Admin |
| `GET` | `/api/v1/materials/{id}` | Xem chi tiết học liệu | 9-Step Authorization Check |
| `POST` | `/api/v1/materials/{id}/submit` | Gửi học liệu lên Admin chờ duyệt | Author Lecturer / Admin |
| `POST` | `/api/v1/materials/{id}/approve` | Admin phê duyệt học liệu | Admin Only |
| `POST` | `/api/v1/materials/{id}/reject` | Admin từ chối học liệu có lý do | Admin Only |
| `GET` | `/api/v1/materials/{id}/download` | Stream tải tập tin an toàn | 9-Step Authorization Check |
| `POST` | `/api/v1/materials/{id}/favorite` | Thêm / Xóa học liệu yêu thích | Authenticated User |
| `GET` | `/api/v1/admin/dashboard` | Thống kê KPI hệ thống | Admin Only |
| `GET` | `/api/v1/admin/users` | Quản lý danh sách người dùng | Admin Only |
| `PUT` | `/api/v1/admin/users/{id}/status`| Khóa / Mở khóa tài khoản | Admin Only |
| `GET` | `/api/v1/admin/audit-logs` | Xem nhật ký an toàn hệ thống | Admin Only |
