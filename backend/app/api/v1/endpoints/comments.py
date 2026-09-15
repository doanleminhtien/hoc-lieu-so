from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models import Comment, Material, User
from app.schemas.schemas import APIResponse, CommentCreate, CommentResponse, CommentUserInfo
from app.api.v1.deps import get_current_user, get_current_user_optional
from app.services.material_service import MaterialService

router = APIRouter(tags=["Comments"])

@router.get("/materials/{material_id}/comments", response_model=APIResponse)
def get_material_comments(
    material_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    material = db.query(Material).filter(Material.id == material_id, Material.is_deleted == False).first()
    if not material:
        raise HTTPException(status_code=404, detail="Học liệu không tồn tại.")

    # Access permission check
    if not MaterialService.check_access_permission(material, current_user):
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem bình luận học liệu này.")

    query = db.query(Comment).filter(Comment.material_id == material_id)
    total = query.count()
    comments = query.order_by(desc(Comment.created_at)).offset((page - 1) * limit).limit(limit).all()

    items = []
    for c in comments:
        u = db.query(User).filter(User.id == c.user_id).first()
        u_info = CommentUserInfo(
            id=u.id,
            full_name=u.full_name,
            avatar_url=u.avatar_url,
            role_name=u.role.name if u and u.role else "STUDENT"
        ) if u else None

        items.append({
            "id": c.id,
            "material_id": c.material_id,
            "user_id": c.user_id,
            "content": c.content,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "user": u_info.dict() if u_info else None
        })

    return APIResponse(data={"items": items, "total": total, "page": page, "limit": limit})

@router.post("/materials/{material_id}/comments", response_model=APIResponse)
def create_comment(
    material_id: int,
    req: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not req.content or not req.content.strip():
        raise HTTPException(status_code=400, detail="Nội dung bình luận không được để trống.")

    material = db.query(Material).filter(Material.id == material_id, Material.is_deleted == False).first()
    if not material:
        raise HTTPException(status_code=404, detail="Học liệu không tồn tại.")

    if not MaterialService.check_access_permission(material, current_user):
        raise HTTPException(status_code=403, detail="Bạn không có quyền bình luận trên học liệu này.")

    comment = Comment(
        material_id=material_id,
        user_id=current_user.id,
        content=req.content.strip()
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    u_info = CommentUserInfo(
        id=current_user.id,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        role_name=current_user.role.name if current_user.role else "STUDENT"
    )

    data = {
        "id": comment.id,
        "material_id": comment.material_id,
        "user_id": comment.user_id,
        "content": comment.content,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
        "user": u_info.dict()
    }
    return APIResponse(message="Thêm bình luận thành công.", data=data)

@router.delete("/comments/{comment_id}", response_model=APIResponse)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Bình luận không tồn tại.")

    user_role = current_user.role.name if current_user.role else "STUDENT"
    if user_role != "ADMIN" and comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa bình luận này.")

    db.delete(comment)
    db.commit()
    return APIResponse(message="Xóa bình luận thành công.")
