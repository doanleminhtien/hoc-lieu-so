from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models import Notification, User
from app.schemas.schemas import APIResponse, NotificationResponse
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=APIResponse)
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(desc(Notification.created_at))
        .limit(30)
        .all()
    )
    result = [NotificationResponse.from_orm(n).dict() for n in notifications]
    unread_count = sum(1 for n in notifications if not n.is_read)
    
    return APIResponse(data={"items": result, "unread_count": unread_count})

@router.put("/{notification_id}/read", response_model=APIResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Thông báo không tồn tại.")

    notif.is_read = True
    db.commit()
    return APIResponse(message="Đã đánh dấu đọc thông báo.")

@router.put("/read-all", response_model=APIResponse)
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return APIResponse(message="Đã đánh dấu đọc tất cả thông báo.")
