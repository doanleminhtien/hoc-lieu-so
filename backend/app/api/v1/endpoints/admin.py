import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.models import User, Role, Material, MaterialView, MaterialDownload, Category, AuditLog, Favorite
from app.schemas.schemas import APIResponse, UserResponse, UserUpdate, AuditLogResponse
from app.api.v1.deps import require_role, get_current_user

try:
    from app.core.security import get_password_hash
except ImportError:
    def get_password_hash(password: str) -> str:
        return password

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

ROLE_MAP = {
    "Giảng viên": "LECTURER",
    "Sinh viên": "STUDENT",
    "Quản trị viên": "ADMIN",
    "LECTURER": "LECTURER",
    "STUDENT": "STUDENT",
    "ADMIN": "ADMIN"
}

class AdminUserCreateRequest(BaseModel):
    email: EmailStr
    password: str = "Password123@"
    full_name: str
    user_code: Optional[str] = None
    faculty: Optional[str] = None
    role_name: Optional[str] = "LECTURER"

class AdminUserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    user_code: Optional[str] = None
    faculty: Optional[str] = None
    role_name: Optional[str] = None
    role: Optional[str] = None
    role_id: Optional[int] = None


def format_audit_details(action: str, details) -> str:
    """Chuyển đổi dữ liệu JSON thô thành câu văn Tiếng Việt dễ đọc."""
    if not details:
        return "Không có thông tin chi tiết"
    
    if isinstance(details, str):
        try:
            details = json.loads(details)
        except Exception:
            return details
            
    if not isinstance(details, dict):
        return str(details)

    if action == "USER_CREATE":
        email = details.get("created_email") or details.get("email") or "người dùng"
        role = details.get("role") or ""
        role_vn = {"LECTURER": "Giảng viên", "STUDENT": "Sinh viên", "ADMIN": "Quản trị viên"}.get(role, role)
        return f"Tạo mới tài khoản {email}" + (f" với vai trò {role_vn}" if role_vn else "")

    elif action == "USER_BLOCK":
        email = details.get("user_email") or details.get("email") or ""
        return f"Đã khóa tài khoản {email}".strip()

    elif action == "USER_UNBLOCK":
        email = details.get("user_email") or details.get("email") or ""
        return f"Đã mở khóa tài khoản {email}".strip()

    elif action == "MATERIAL_APPROVE":
        title = details.get("title") or "học liệu"
        return f"Đã phê duyệt học liệu: \"{title}\""

    elif action == "MATERIAL_REJECT":
        title = details.get("title") or "học liệu"
        reason = details.get("reason") or ""
        return f"Từ chối học liệu: \"{title}\"" + (f" (Lý do: {reason})" if reason else "")

    elif action in ["USER_UPDATE", "USER_EDIT"]:
        email = details.get("user_email") or details.get("email") or ""
        return f"Cập nhật thông tin tài khoản {email}".strip()

    parts = [f"{k}: {v}" for k, v in details.items()]
    return ", ".join(parts)


@router.get("/dashboard", response_model=APIResponse)
def get_admin_dashboard_kpis(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["ADMIN"]))
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_materials = db.query(func.count(Material.id)).filter(Material.is_deleted == False).scalar() or 0
    pending_materials = db.query(func.count(Material.id)).filter(Material.approval_status == "PENDING_APPROVAL", Material.is_deleted == False).scalar() or 0
    published_materials = db.query(func.count(Material.id)).filter(Material.approval_status == "PUBLISHED", Material.is_deleted == False).scalar() or 0
    total_views = db.query(func.count(MaterialView.id)).scalar() or 0
    total_downloads = db.query(func.count(MaterialDownload.id)).scalar() or 0

    cat_counts = (
        db.query(Category.name, func.count(Material.id))
        .join(Material, Material.category_id == Category.id)
        .filter(Material.is_deleted == False)
        .group_by(Category.name)
        .all()
    )
    by_category = [{"category": name, "count": count} for name, count in cat_counts]

    popular = (
        db.query(Material.id, Material.title, Material.view_count, Material.download_count)
        .filter(Material.approval_status == "PUBLISHED", Material.is_deleted == False)
        .order_by(desc(Material.view_count))
        .limit(5)
        .all()
    )
    pop_list = [{"id": p.id, "title": p.title, "view_count": p.view_count, "download_count": p.download_count} for p in popular]

    return APIResponse(
        data={
            "total_users": total_users,
            "total_materials": total_materials,
            "pending_materials": pending_materials,
            "published_materials": published_materials,
            "total_views": total_views,
            "total_downloads": total_downloads,
            "materials_by_category": by_category,
            "popular_materials": pop_list
        }
    )


@router.get("/users", response_model=APIResponse)
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["ADMIN"]))
):
    query = db.query(User)
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            (User.full_name.ilike(term)) | (User.email.ilike(term)) | (User.user_code.ilike(term))
        )
    total = query.count()
    users = query.order_by(desc(User.created_at)).offset((page - 1) * limit).limit(limit).all()

    result = [
        UserResponse(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            user_code=u.user_code,
            faculty=u.faculty,
            avatar_url=u.avatar_url,
            role_id=u.role_id,
            role_name=u.role.name if u.role else "",
            is_active=u.is_active,
            is_blocked=u.is_blocked,
            created_at=u.created_at
        ).dict() for u in users
    ]
    return APIResponse(data={"items": result, "total": total, "page": page, "limit": limit})


@router.post("/users", response_model=APIResponse)
def create_user(
    user_in: AdminUserCreateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["ADMIN"]))
):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email này đã được sử dụng trong hệ thống."
        )

    target_role_str = ROLE_MAP.get(user_in.role_name, "LECTURER")
    role = db.query(Role).filter(Role.name == target_role_str).first()
    role_id = role.id if role else 2

    new_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        user_code=user_in.user_code,
        faculty=user_in.faculty,
        role_id=role_id,
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
        is_blocked=False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    audit = AuditLog(
        user_id=admin.id,
        action="USER_CREATE",
        target_entity="User",
        target_id=new_user.id,
        details={"created_email": new_user.email, "role": target_role_str}
    )
    db.add(audit)
    db.commit()

    return APIResponse(message="Tạo tài khoản thành công!", data={"id": new_user.id})


@router.put("/users/{user_id}", response_model=APIResponse)
@router.patch("/users/{user_id}", response_model=APIResponse)
def update_user_details(
    user_id: int,
    user_in: AdminUserUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["ADMIN"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại.")

    input_role = user_in.role_name or user_in.role
    if input_role:
        role_code = ROLE_MAP.get(input_role, input_role)
        role = db.query(Role).filter((Role.name == role_code) | (Role.name == input_role)).first()
        if role:
            user.role_id = role.id
    elif user_in.role_id:
        user.role_id = user_in.role_id

    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.user_code is not None:
        user.user_code = user_in.user_code
    if user_in.faculty is not None:
        user.faculty = user_in.faculty

    db.commit()
    db.refresh(user)

    return APIResponse(message="Cập nhật tài khoản thành công!")


@router.put("/users/{user_id}/status", response_model=APIResponse)
def toggle_user_block_status(
    user_id: int,
    is_blocked: bool,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["ADMIN"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại.")
        
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Không thể tự khóa tài khoản Admin của chính bạn.")

    user.is_blocked = is_blocked
    
    action = "USER_BLOCK" if is_blocked else "USER_UNBLOCK"
    audit = AuditLog(
        user_id=admin.id,
        action=action,
        target_entity="User",
        target_id=user.id,
        details={"user_email": user.email, "is_blocked": is_blocked}
    )
    db.add(audit)
    db.commit()

    msg = f"Đã {'khóa' if is_blocked else 'mở khóa'} tài khoản {user.email} thành công."
    return APIResponse(message=msg)


@router.get("/audit-logs", response_model=APIResponse)
def get_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["ADMIN"]))
):
    query = db.query(AuditLog)
    total = query.count()
    logs = query.order_by(desc(AuditLog.created_at)).offset((page - 1) * limit).limit(limit).all()

    result = []
    for l in logs:
        u = db.query(User).filter(User.id == l.user_id).first()
        result.append({
            "id": l.id,
            "user_id": l.user_id,
            "user_name": u.full_name if u else "Hệ thống",
            "action": l.action,
            "target_entity": l.target_entity,
            "target_id": l.target_id,
            "details": format_audit_details(l.action, l.details),
            "ip_address": l.ip_address,
            "created_at": l.created_at
        })

    return APIResponse(data={"items": result, "total": total, "page": page, "limit": limit})