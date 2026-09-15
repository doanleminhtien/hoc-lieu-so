from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, BigInteger, SmallInteger, CheckConstraint, Table, JSON, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base

# Junction table for Material and Tag
material_tags = Table(
    "material_tags",
    Base.metadata,
    Column("material_id", Integer, ForeignKey("materials.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(20), unique=True, nullable=False) # 'ADMIN', 'LECTURER', 'STUDENT'
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    user_code = Column(String(20), unique=True, nullable=True) # MSSV / Mã Giảng viên
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False)
    faculty = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    role = relationship("Role", back_populates="users")
    materials = relationship("Material", back_populates="author", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(120), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    parent = relationship("Category", remote_side=[id], backref="children")
    materials = relationship("Material", back_populates="category")


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(280), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    subject = Column(String(150), nullable=False, index=True) # Môn học / Học phần
    course_code = Column(String(20), nullable=True, index=True) # e.g. INT1234
    academic_year = Column(String(20), nullable=True) # e.g. 2025-2026
    semester = Column(SmallInteger, nullable=True) # 1, 2, 3
    faculty = Column(String(100), nullable=True, index=True)
    language = Column(String(10), default="vi")
    author_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    
    # Workflow State Machine: DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, PUBLISHED
    approval_status = Column(String(25), default="DRAFT", nullable=False, index=True)
    # Access Level: PUBLIC, AUTHENTICATED, ROLE_BASED, PRIVATE
    access_level = Column(String(20), default="PUBLIC", nullable=False, index=True)
    
    rejection_reason = Column(Text, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    view_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    allow_download = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False)
    
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('idx_materials_filter', 'category_id', 'access_level', 'approval_status', 'created_at'),
        Index('idx_materials_search', 'subject', 'course_code', 'faculty'),
    )

    author = relationship("User", back_populates="materials")
    category = relationship("Category", back_populates="materials")
    files = relationship("MaterialFile", back_populates="material", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=material_tags, back_populates="materials")
    permissions = relationship("AccessPermission", back_populates="material", cascade="all, delete-orphan")
    views = relationship("MaterialView", back_populates="material", cascade="all, delete-orphan")
    downloads = relationship("MaterialDownload", back_populates="material", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="material", cascade="all, delete-orphan")


class MaterialFile(Base):
    __tablename__ = "material_files"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id", ondelete="CASCADE"), nullable=False)
    original_name = Column(String(255), nullable=False)
    stored_name = Column(String(255), unique=True, nullable=False)
    storage_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_extension = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    material = relationship("Material", back_populates="files")
    downloads = relationship("MaterialDownload", back_populates="file", cascade="all, delete-orphan")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    slug = Column(String(60), unique=True, nullable=False)

    materials = relationship("Material", secondary=material_tags, back_populates="tags")


class AccessPermission(Base):
    __tablename__ = "access_permissions"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id", ondelete="CASCADE"), nullable=False)
    granted_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    granted_role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    material = relationship("Material", back_populates="permissions")


class MaterialView(Base):
    __tablename__ = "material_views"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    viewed_at = Column(DateTime, default=datetime.utcnow)

    material = relationship("Material", back_populates="views")


class MaterialDownload(Base):
    __tablename__ = "material_downloads"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id", ondelete="CASCADE"), nullable=False)
    file_id = Column(Integer, ForeignKey("material_files.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    ip_address = Column(String(45), nullable=True)
    downloaded_at = Column(DateTime, default=datetime.utcnow)

    material = relationship("Material", back_populates="downloads")
    file = relationship("MaterialFile", back_populates="downloads")


class Favorite(Base):
    __tablename__ = "favorites"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    material_id = Column(Integer, ForeignKey("materials.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="favorites")
    material = relationship("Material", back_populates="favorites")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(30), default="INFO") # APPROVAL, REJECT, PERMISSION, SYSTEM
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(50), nullable=False)
    target_entity = Column(String(50), nullable=False)
    target_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    material = relationship("Material", backref="comments")
    user = relationship("User", backref="comments")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(SmallInteger, nullable=False) # 1 to 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id', 'material_id', name='uq_user_material_review'),
        CheckConstraint('rating >= 1 AND rating <= 5', name='ck_review_rating_range'),
    )

    material = relationship("Material", backref="reviews")
    user = relationship("User", backref="reviews")
