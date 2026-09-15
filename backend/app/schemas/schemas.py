from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field

# Base Generic Response
class APIResponse(BaseModel):
    success: bool = True
    message: Optional[str] = "Thao tác thành công."
    data: Optional[Any] = None

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

class APIErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail

# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    user_code: Optional[str] = None
    faculty: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    user_code: Optional[str] = None
    faculty: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role_id: int
    role_name: str
    is_active: bool
    is_blocked: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    user_code: Optional[str] = None
    faculty: Optional[str] = None
    avatar_url: Optional[str] = None
    is_blocked: Optional[bool] = None

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    slug: str
    created_at: datetime

    class Config:
        from_attributes = True

# Tag Schemas
class TagResponse(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True

# Material File Schema
class MaterialFileResponse(BaseModel):
    id: int
    original_name: str
    file_size: int
    mime_type: str
    file_extension: str
    created_at: datetime

    class Config:
        from_attributes = True

# Material Schemas
class MaterialBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str
    course_code: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[int] = None
    faculty: Optional[str] = None
    language: Optional[str] = "vi"
    category_id: int
    access_level: Optional[str] = "PUBLIC"
    allow_download: Optional[bool] = True

class MaterialCreate(MaterialBase):
    tags: Optional[List[str]] = []

class MaterialUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    course_code: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[int] = None
    faculty: Optional[str] = None
    language: Optional[str] = None
    category_id: Optional[int] = None
    access_level: Optional[str] = None
    allow_download: Optional[bool] = None
    tags: Optional[List[str]] = None

class AuthorInfo(BaseModel):
    id: int
    full_name: str
    avatar_url: Optional[str] = None
    role_name: Optional[str] = "LECTURER"
    faculty: Optional[str] = "Khoa Công Nghệ Thông Tin"

    class Config:
        from_attributes = True

class MaterialResponse(MaterialBase):
    id: int
    slug: str
    author_id: int
    author_name: str
    author: Optional[AuthorInfo] = None
    category_name: str
    approval_status: str
    rejection_reason: Optional[str] = None
    thumbnail_url: Optional[str] = None
    view_count: int
    download_count: int
    allow_download: bool = True
    is_favorite: Optional[bool] = False
    files: List[MaterialFileResponse] = []
    tags: List[TagResponse] = []
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Approval Action
class RejectMaterialRequest(BaseModel):
    rejection_reason: str

# Notification Schema
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Audit Log Schema
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    action: str
    target_entity: str
    target_id: Optional[int] = None
    details: Optional[Any] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard KPI Schemas
class AdminDashboardKPI(BaseModel):
    total_users: int
    total_materials: int
    pending_materials: int
    published_materials: int
    total_views: int
    total_downloads: int
    materials_by_category: List[dict]
    popular_materials: List[dict]

class LecturerDashboardKPI(BaseModel):
    total_materials: int
    published: int
    pending: int
    rejected: int
    total_views: int
    total_downloads: int
    recent_materials: List[dict]

class StudentDashboardKPI(BaseModel):
    favorites_count: int
    viewed_count: int
    download_count: int
    recent_viewed: List[dict]
    recommended_materials: List[dict]

# Comment Schemas
class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class CommentUserInfo(BaseModel):
    id: int
    full_name: str
    avatar_url: Optional[str] = None
    role_name: Optional[str] = "STUDENT"

    class Config:
        from_attributes = True

class CommentResponse(BaseModel):
    id: int
    material_id: int
    user_id: int
    content: str
    created_at: datetime
    updated_at: datetime
    user: Optional[CommentUserInfo] = None

    class Config:
        from_attributes = True

# Review / Rating Schemas
class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Điểm đánh giá từ 1 đến 5 sao")
    comment: Optional[str] = Field(None, max_length=1000)

class ReviewResponse(BaseModel):
    id: int
    material_id: int
    user_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[CommentUserInfo] = None

    class Config:
        from_attributes = True

class MaterialRatingStats(BaseModel):
    average_rating: float
    total_reviews: int
    rating_counts: dict
