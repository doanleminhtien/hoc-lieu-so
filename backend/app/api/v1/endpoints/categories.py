from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Category
from app.schemas.schemas import APIResponse, CategoryCreate, CategoryResponse
from app.api.v1.deps import require_role
import re

router = APIRouter(prefix="/categories", tags=["Categories"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text

@router.get("", response_model=APIResponse)
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    result = [
        CategoryResponse.from_orm(c).dict() for c in categories
    ]
    return APIResponse(data=result)

@router.post("", response_model=APIResponse)
def create_category(
    req: CategoryCreate,
    db: Session = Depends(get_db),
    admin = Depends(require_role(["ADMIN"]))
):
    slug = slugify(req.name)
    existing = db.query(Category).filter(Category.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Danh mục với tên này đã tồn tại.")
        
    category = Category(
        name=req.name,
        slug=slug,
        description=req.description,
        parent_id=req.parent_id
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return APIResponse(message="Tạo danh mục thành công.", data=CategoryResponse.from_orm(category).dict())
