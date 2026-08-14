from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import APIResponse, RegisterRequest, LoginRequest, TokenResponse, RefreshTokenRequest, UserResponse, UserUpdate
from app.services.auth_service import AuthService
from app.api.v1.deps import get_current_user
from app.models import User, Material

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=APIResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    user = AuthService.register_user(db, req)
    return APIResponse(
        message="Đăng ký tài khoản thành công! Vui lòng đăng nhập.",
        data={"user_id": user.id, "email": user.email}
    )

@router.post("/login", response_model=APIResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    token = AuthService.authenticate_user(db, req)
    return APIResponse(
        message="Đăng nhập thành công.",
        data=token.dict()
    )

@router.post("/refresh", response_model=APIResponse)
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    token = AuthService.refresh_access_token(db, req.refresh_token)
    return APIResponse(
        message="Làm mới token thành công.",
        data=token.dict()
    )

@router.get("/me", response_model=APIResponse)
def get_me(current_user: User = Depends(get_current_user)):
    user_data = UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        user_code=current_user.user_code,
        faculty=current_user.faculty,
        avatar_url=current_user.avatar_url,
        role_id=current_user.role_id,
        role_name=current_user.role.name if current_user.role else "STUDENT",
        is_active=current_user.is_active,
        is_blocked=current_user.is_blocked,
        created_at=current_user.created_at
    )
    return APIResponse(data=user_data.dict())

@router.put("/profile", response_model=APIResponse)
def update_profile(
    req: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if req.full_name:
        current_user.full_name = req.full_name
    if req.user_code is not None:
        current_user.user_code = req.user_code
    if req.faculty is not None:
        current_user.faculty = req.faculty
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url

    db.commit()
    db.refresh(current_user)
    return APIResponse(message="Cập nhật thông tin cá nhân thành công.")

@router.get("/lecturers/{lecturer_id}", response_model=APIResponse)
def get_lecturer_public_profile(lecturer_id: int, db: Session = Depends(get_db)):
    lecturer = db.query(User).filter(User.id == lecturer_id).first()
    if not lecturer:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin Giảng viên.")

    published_materials = db.query(Material).filter(
        Material.author_id == lecturer_id,
        Material.approval_status == "PUBLISHED",
        Material.is_deleted == False
    ).order_by(Material.created_at.desc()).all()

    mat_list = []
    for m in published_materials:
        mat_list.append({
            "id": m.id,
            "title": m.title,
            "slug": m.slug,
            "subject": m.subject,
            "course_code": m.course_code,
            "category_name": m.category.name if m.category else "",
            "view_count": m.view_count,
            "download_count": m.download_count,
            "created_at": m.created_at
        })

    return APIResponse(
        data={
            "id": lecturer.id,
            "full_name": lecturer.full_name,
            "avatar_url": lecturer.avatar_url,
            "user_code": lecturer.user_code,
            "faculty": lecturer.faculty or "Khoa Công Nghệ Thông Tin",
            "role_name": lecturer.role.name if lecturer.role else "LECTURER",
            "published_count": len(mat_list),
            "materials": mat_list
        }
    )
