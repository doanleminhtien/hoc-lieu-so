from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.models import Review, Material, User
from app.schemas.schemas import APIResponse, ReviewCreate, ReviewResponse, CommentUserInfo, MaterialRatingStats
from app.api.v1.deps import get_current_user, get_current_user_optional
from app.services.material_service import MaterialService

router = APIRouter(tags=["Reviews & Ratings"])

def calculate_rating_stats(db: Session, material_id: int) -> dict:
    reviews = db.query(Review).filter(Review.material_id == material_id).all()
    total = len(reviews)
    if total == 0:
        return {
            "average_rating": 0.0,
            "total_reviews": 0,
            "rating_counts": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }

    avg = sum(r.rating for r in reviews) / total
    counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in reviews:
        counts[r.rating] = counts.get(r.rating, 0) + 1

    return {
        "average_rating": round(avg, 1),
        "total_reviews": total,
        "rating_counts": counts
    }

@router.get("/materials/{material_id}/reviews", response_model=APIResponse)
def get_material_reviews(
    material_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    material = db.query(Material).filter(Material.id == material_id, Material.is_deleted == False).first()
    if not material:
        raise HTTPException(status_code=404, detail="Học liệu không tồn tại.")

    if not MaterialService.check_access_permission(material, current_user):
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem đánh giá học liệu này.")

    stats = calculate_rating_stats(db, material_id)

    query = db.query(Review).filter(Review.material_id == material_id)
    reviews = query.order_by(desc(Review.created_at)).offset((page - 1) * limit).limit(limit).all()

    items = []
    user_review = None
    for r in reviews:
        u = db.query(User).filter(User.id == r.user_id).first()
        u_info = CommentUserInfo(
            id=u.id,
            full_name=u.full_name,
            avatar_url=u.avatar_url,
            role_name=u.role.name if u and u.role else "STUDENT"
        ) if u else None

        r_dict = {
            "id": r.id,
            "material_id": r.material_id,
            "user_id": r.user_id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
            "user": u_info.dict() if u_info else None
        }
        items.append(r_dict)
        if current_user and r.user_id == current_user.id:
            user_review = r_dict

    return APIResponse(data={
        "items": items,
        "stats": stats,
        "user_review": user_review,
        "page": page,
        "limit": limit
    })

@router.post("/materials/{material_id}/reviews", response_model=APIResponse)
def upsert_review(
    material_id: int,
    req: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if req.rating < 1 or req.rating > 5:
        raise HTTPException(status_code=400, detail="Điểm đánh giá phải từ 1 đến 5 sao.")

    material = db.query(Material).filter(Material.id == material_id, Material.is_deleted == False).first()
    if not material:
        raise HTTPException(status_code=404, detail="Học liệu không tồn tại.")

    if not MaterialService.check_access_permission(material, current_user):
        raise HTTPException(status_code=403, detail="Bạn không có quyền đánh giá học liệu này.")

    existing = db.query(Review).filter(Review.material_id == material_id, Review.user_id == current_user.id).first()
    message = "Cập nhật đánh giá thành công." if existing else "Thêm đánh giá thành công."

    if existing:
        existing.rating = req.rating
        existing.comment = req.comment.strip() if req.comment else None
        review = existing
    else:
        review = Review(
            material_id=material_id,
            user_id=current_user.id,
            rating=req.rating,
            comment=req.comment.strip() if req.comment else None
        )
        db.add(review)

    db.commit()
    db.refresh(review)

    stats = calculate_rating_stats(db, material_id)
    return APIResponse(message=message, data={"id": review.id, "rating": review.rating, "stats": stats})

@router.delete("/reviews/{review_id}", response_model=APIResponse)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Đánh giá không tồn tại.")

    user_role = current_user.role.name if current_user.role else "STUDENT"
    if user_role != "ADMIN" and review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa đánh giá này.")

    mat_id = review.material_id
    db.delete(review)
    db.commit()

    stats = calculate_rating_stats(db, mat_id)
    return APIResponse(message="Xóa đánh giá thành công.", data={"stats": stats})
