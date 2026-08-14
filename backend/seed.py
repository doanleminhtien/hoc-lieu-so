import os
import sys
from datetime import datetime

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import Role, User, Category, Material, Tag, Notification

def seed_data():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("[SEED] Seeding Roles...")
        roles_data = [
            {"id": 1, "name": "ADMIN", "description": "Quản trị viên hệ thống học liệu"},
            {"id": 2, "name": "LECTURER", "description": "Giảng viên - Tạo và tải lên học liệu"},
            {"id": 3, "name": "STUDENT", "description": "Sinh viên - Tìm kiếm và khai thác học liệu"}
        ]
        for r in roles_data:
            existing = db.query(Role).filter(Role.name == r["name"]).first()
            if not existing:
                role = Role(id=r["id"], name=r["name"], description=r["description"])
                db.add(role)
        db.commit()

        print("[SEED] Seeding Users...")
        admin_role = db.query(Role).filter(Role.name == "ADMIN").first()
        lecturer_role = db.query(Role).filter(Role.name == "LECTURER").first()
        student_role = db.query(Role).filter(Role.name == "STUDENT").first()

        users_data = [
            {
                "email": "admin@university.edu.vn",
                "password": get_password_hash("Admin@123456"),
                "full_name": "Quản Trị Viên Hệ Thống",
                "user_code": "ADM001",
                "faculty": "Phòng Đào Tạo & CNTT",
                "role_id": admin_role.id
            },
            {
                "email": "nguyenvanhai@university.edu.vn",
                "password": get_password_hash("nguyenvanhai@123456"),
                "full_name": "TS. Nguyễn Văn Hải",
                "user_code": "GV202601",
                "faculty": "Khoa Công Nghệ Thông Tin",
                "role_id": lecturer_role.id
            },
            {
                "email": "nguyenanhkhoa@university.edu.vn",
                "password": get_password_hash("nguyenanhkhoa@123456"),
                "full_name": "Nguyễn Anh Khoa",
                "user_code": "SV2200004825",
                "faculty": "Khoa Công Nghệ Thông Tin",
                "role_id": student_role.id
            }
        ]

        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(
                    email=u["email"],
                    hashed_password=u["password"],
                    full_name=u["full_name"],
                    user_code=u["user_code"],
                    faculty=u["faculty"],
                    role_id=u["role_id"],
                    is_active=True,
                    is_blocked=False
                )
                db.add(user)
        db.commit()

        print("[SEED] Seeding Categories...")
        categories_data = [
            {"name": "Công Nghệ Thông Tin", "slug": "cong-nghe-thong-tin", "description": "Tài liệu chuyên ngành Khoa học máy tính & Công nghệ phần mềm"},
            {"name": "Khoa Học Dữ Liệu & AI", "slug": "khoa-hoc-du-lieu-ai", "description": "Tài liệu về Trí tuệ nhân tạo, Machine Learning & Big Data"},
            {"name": "An Thiết & An Toàn Thông Tin", "slug": "an-toan-thong-tin", "description": "Tài liệu Mạng máy tính, Cryptography & Cyber Security"},
            {"name": "Kinh Tế Số & Quản Trị", "slug": "kinh-te-so", "description": "Tài liệu Kinh tế số, Thương mại điện tử & Hệ thống thông tin"},
            {"name": "Điện Tử - Viễn Thông", "slug": "dien-tu-vien-thong", "description": "Tài liệu Viễn thông, IoT & Thiết kế vi mạch"}
        ]
        for c in categories_data:
            existing = db.query(Category).filter(Category.slug == c["slug"]).first()
            if not existing:
                cat = Category(name=c["name"], slug=c["slug"], description=c["description"])
                db.add(cat)
        db.commit()

        print("[SEED] Seeding Sample Materials...")
        lecturer = db.query(User).filter(User.email == "nguyenvanhai@university.edu.vn").first()
        cntt_cat = db.query(Category).filter(Category.slug == "cong-nghe-thong-tin").first()
        ai_cat = db.query(Category).filter(Category.slug == "khoa-hoc-du-lieu-ai").first()

        materials_data = [
            {
                "title": "Giáo trình Kiến trúc Phần mềm & Clean Architecture",
                "slug": "giao-trinh-kien-truc-phan-mem-clean-architecture",
                "description": "Tài liệu giảng dạy môn Kiến trúc phần mềm ứng dụng FastAPI & React chuẩn Đồ án Tốt nghiệp.",
                "subject": "Kiến Trúc Phần Mềm",
                "course_code": "INT3201",
                "academic_year": "2025-2026",
                "semester": 1,
                "faculty": "Khoa Công Nghệ Thông Tin",
                "category_id": cntt_cat.id,
                "author_id": lecturer.id,
                "approval_status": "PUBLISHED",
                "access_level": "PUBLIC",
                "view_count": 142,
                "download_count": 48,
                "published_at": datetime.utcnow()
            },
            {
                "title": "Bài giảng Trí tuệ Nhân tạo & Deep Learning Cơ bản",
                "slug": "bai-giang-tri-tue-nhan-tao-deep-learning-co-ban",
                "description": "Tổng quan về Mạng Nơ-ron Nhân tạo, Convolutional Neural Networks và Ứng dụng trong xử lý ảnh.",
                "subject": "Trí Tuệ Nhân Tạo",
                "course_code": "INT3402",
                "academic_year": "2025-2026",
                "semester": 2,
                "faculty": "Khoa Công Nghệ Thông Tin",
                "category_id": ai_cat.id,
                "author_id": lecturer.id,
                "approval_status": "PENDING_APPROVAL",
                "access_level": "AUTHENTICATED",
                "view_count": 25,
                "download_count": 5
            }
        ]

        for m in materials_data:
            existing = db.query(Material).filter(Material.slug == m["slug"]).first()
            if not existing:
                mat = Material(**m)
                db.add(mat)
        db.commit()

        print("[SUCCESS] Database Seeded Successfully!")
    except Exception as e:
        print(f"[ERROR] Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
