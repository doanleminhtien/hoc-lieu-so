from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.models import User, Role, Material, MaterialView, MaterialDownload, Category, AuditLog, Favorite
from app.schemas.schemas import APIResponse, UserResponse, UserUpdate, AuditLogResponse
from app.api.v1.deps import require_role, get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

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

    # Materials by Category (SQL Aggregation)
    cat_counts = (
        db.query(Category.name, func.count(Material.id))
        .join(Material, Material.category_id == Category.id)
        .filter(Material.is_deleted == False)
        .group_by(Category.name)
        .all()
    )
    by_category = [{"category": name, "count": count} for name, count in cat_counts]

    # Popular Materials
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
    
    # Audit Log
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
            "details": l.details,
            "ip_address": l.ip_address,
            "created_at": l.created_at
        })

    return APIResponse(data={"items": result, "total": total, "page": page, "limit": limit})
