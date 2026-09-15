import os
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Request, Body
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc

from app.core.database import get_db
from app.core.storage import get_storage_provider, BaseStorageProvider
from app.models import Material, MaterialFile, Category, Tag, MaterialView, MaterialDownload, Favorite, User, AuditLog
from app.schemas.schemas import APIResponse, MaterialCreate, MaterialResponse, RejectMaterialRequest, MaterialUpdate
from app.services.material_service import MaterialService
from app.api.v1.deps import get_current_user, get_current_user_optional, require_role

router = APIRouter(prefix="/materials", tags=["Materials"])

@router.get("", response_model=APIResponse)
def search_materials(
    q: Optional[str] = Query(None, description="Từ khóa tìm kiếm (Title, Description, Subject)"),
    category_id: Optional[int] = Query(None),
    faculty: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    access_level: Optional[str] = Query(None),
    approval_status: Optional[str] = Query("PUBLISHED"),
    sort_by: Optional[str] = Query("created_at"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(Material).filter(Material.is_deleted == False)

    # Filter status based on user role
    if not current_user or (current_user.role and current_user.role.name == "STUDENT"):
        query = query.filter(Material.approval_status == "PUBLISHED", Material.access_level == "PUBLIC")
    elif approval_status:
        query = query.filter(Material.approval_status == approval_status)

    # Keyword Search
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Material.title.ilike(term),
                Material.description.ilike(term),
                Material.subject.ilike(term),
                Material.course_code.ilike(term)
            )
        )

    if category_id:
        query = query.filter(Material.category_id == category_id)
    if faculty:
        query = query.filter(Material.faculty == faculty)
    if subject:
        query = query.filter(Material.subject == subject)
    if access_level:
        query = query.filter(Material.access_level == access_level)

    total = query.count()

    # Sort
    if sort_by == "views":
        query = query.order_by(desc(Material.view_count))
    elif sort_by == "downloads":
        query = query.order_by(desc(Material.download_count))
    else:
        query = query.order_by(desc(Material.created_at))

    # Pagination
    materials = query.offset((page - 1) * limit).limit(limit).all()

    # Build Response List with User Favorite Check
    fav_ids = set()
    if current_user:
        user_favs = db.query(Favorite.material_id).filter(Favorite.user_id == current_user.id).all()
        fav_ids = {f[0] for f in user_favs}

    result = []
    for m in materials:
        # Evaluate 9-step access check
        if not MaterialService.check_access_permission(m, current_user):
            continue
            
        m_dict = {
            "id": m.id,
            "title": m.title,
            "slug": m.slug,
            "description": m.description,
            "subject": m.subject,
            "course_code": m.course_code,
            "academic_year": m.academic_year,
            "semester": m.semester,
            "faculty": m.faculty,
            "language": m.language,
            "category_id": m.category_id,
            "category_name": m.category.name if m.category else "",
            "author_id": m.author_id,
            "author_name": m.author.full_name if m.author else "",
            "author": {
                "id": m.author.id,
                "full_name": m.author.full_name,
                "avatar_url": m.author.avatar_url,
                "role_name": m.author.role.name if m.author and m.author.role else "LECTURER",
                "faculty": m.author.faculty or "Khoa Công Nghệ Thông Tin"
            } if m.author else None,
            "approval_status": m.approval_status,
            "access_level": m.access_level,
            "rejection_reason": m.rejection_reason,
            "thumbnail_url": m.thumbnail_url,
            "view_count": m.view_count,
            "download_count": m.download_count,
            "is_favorite": m.id in fav_ids,
            "files": [{"id": f.id, "original_name": f.original_name, "file_size": f.file_size, "mime_type": f.mime_type, "file_extension": f.file_extension, "created_at": f.created_at} for f in m.files],
            "tags": [{"id": t.id, "name": t.name, "slug": t.slug} for t in m.tags],
            "published_at": m.published_at,
            "created_at": m.created_at,
            "updated_at": m.updated_at
        }
        result.append(m_dict)

    return APIResponse(
        data={
            "items": result,
            "total": total,
            "page": page,
            "limit": limit
        }
    )

@router.post("", response_model=APIResponse)
async def create_material(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    subject: str = Form(...),
    course_code: Optional[str] = Form(None),
    academic_year: Optional[str] = Form(None),
    semester: Optional[int] = Form(None),
    faculty: Optional[str] = Form(None),
    language: Optional[str] = Form("vi"),
    category_id: int = Form(...),
    access_level: Optional[str] = Form("PUBLIC"),
    tags: Optional[str] = Form(None), # Comma-separated
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["LECTURER", "ADMIN"])),
    storage: BaseStorageProvider = Depends(get_storage_provider)
):
    tag_list = [t.strip() for t in tags.split(",")] if tags else []
    mat_in = MaterialCreate(
        title=title,
        description=description,
        subject=subject,
        course_code=course_code,
        academic_year=academic_year,
        semester=semester,
        faculty=faculty,
        language=language,
        category_id=category_id,
        access_level=access_level,
        tags=tag_list
    )
    material = MaterialService.create_material(db, mat_in, current_user.id, file, storage)
    return APIResponse(message="Tạo học liệu thành công (Trạng thái: DRAFT).", data={"id": material.id, "slug": material.slug})

@router.get("/history/me", response_model=APIResponse)
def get_my_reading_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subquery = db.query(
        MaterialView.material_id,
        func.max(MaterialView.viewed_at).label("latest_viewed_at")
    ).filter(
        MaterialView.user_id == current_user.id
    ).group_by(MaterialView.material_id).subquery()

    query = db.query(Material, subquery.c.latest_viewed_at).join(
        subquery, Material.id == subquery.c.material_id
    ).filter(Material.is_deleted == False)

    total = query.count()
    results = query.order_by(desc(subquery.c.latest_viewed_at)).offset((page - 1) * limit).limit(limit).all()

    items = []
    for mat, viewed_at in results:
        items.append({
            "id": mat.id,
            "title": mat.title,
            "slug": mat.slug,
            "subject": mat.subject,
            "course_code": mat.course_code,
            "category_name": mat.category.name if mat.category else "Chưa phân loại",
            "author_name": mat.author.full_name if mat.author else "Giảng viên",
            "view_count": mat.view_count,
            "download_count": mat.download_count,
            "viewed_at": viewed_at
        })

    return APIResponse(data={"items": items, "total": total, "page": page, "limit": limit})

@router.get("/{material_id}", response_model=APIResponse)
def get_material_detail(
    material_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    material = db.query(Material).filter(Material.id == material_id, Material.is_deleted == False).first()
    if not material:
        raise HTTPException(status_code=404, detail="Không tìm thấy học liệu.")

    # 9-Step Authorization Check
    if not MaterialService.check_access_permission(material, current_user):
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập học liệu này.")

    # Log View Event & Increment Atomic Counter
    material.view_count += 1
    view_log = MaterialView(
        material_id=material.id,
        user_id=current_user.id if current_user else None,
        ip_address=request.client.host if request.client else None
    )
    db.add(view_log)
    db.commit()

    is_fav = False
    if current_user:
        fav = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.material_id == material.id).first()
        is_fav = fav is not None

    m_dict = {
        "id": material.id,
        "title": material.title,
        "slug": material.slug,
        "description": material.description,
        "subject": material.subject,
        "course_code": material.course_code,
        "academic_year": material.academic_year,
        "semester": material.semester,
        "faculty": material.faculty,
        "language": material.language,
        "category_id": material.category_id,
        "category_name": material.category.name if material.category else "",
        "author_id": material.author_id,
        "author_name": material.author.full_name if material.author else "",
        "author": {
            "id": material.author.id,
            "full_name": material.author.full_name,
            "avatar_url": material.author.avatar_url,
            "role_name": material.author.role.name if material.author and material.author.role else "LECTURER",
            "faculty": material.author.faculty or "Khoa Công Nghệ Thông Tin"
        } if material.author else None,
        "approval_status": material.approval_status,
        "access_level": material.access_level,
        "rejection_reason": material.rejection_reason,
        "thumbnail_url": material.thumbnail_url,
        "view_count": material.view_count,
        "download_count": material.download_count,
        "is_favorite": is_fav,
        "files": [{"id": f.id, "original_name": f.original_name, "file_size": f.file_size, "mime_type": f.mime_type, "file_extension": f.file_extension, "created_at": f.created_at} for f in material.files],
        "tags": [{"id": t.id, "name": t.name, "slug": t.slug} for t in material.tags],
        "published_at": material.published_at,
        "created_at": material.created_at,
        "updated_at": material.updated_at
    }
    return APIResponse(data=m_dict)

@router.post("/{material_id}/submit", response_model=APIResponse)
def submit_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["LECTURER", "ADMIN"]))
):
    user_role = current_user.role.name if current_user.role else "LECTURER"
    mat = MaterialService.submit_for_approval(db, material_id, current_user.id, user_role)
    return APIResponse(message="Đã gửi học liệu lên Quản trị viên để phê duyệt.", data={"approval_status": mat.approval_status})

@router.post("/{material_id}/approve", response_model=APIResponse)
def approve_material(
    material_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["ADMIN"]))
):
    mat = MaterialService.approve_material(db, material_id, admin.id)
    return APIResponse(message="Đã phê duyệt và xuất bản học liệu thành công.", data={"approval_status": mat.approval_status})

@router.post("/{material_id}/reject", response_model=APIResponse)
def reject_material(
    material_id: int,
    req: RejectMaterialRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["ADMIN"]))
):
    mat = MaterialService.reject_material(db, material_id, admin.id, req.rejection_reason)
    return APIResponse(message="Đã từ chối học liệu.", data={"approval_status": mat.approval_status, "reason": mat.rejection_reason})

@router.get("/{material_id}/download", response_class=FileResponse)
async def download_material_file(
    material_id: int,
    request: Request,
    file_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
    storage: BaseStorageProvider = Depends(get_storage_provider)
):
    material = db.query(Material).filter(Material.id == material_id, Material.is_deleted == False).first()
    if not material:
        raise HTTPException(status_code=404, detail="Học liệu không tồn tại.")

    # 9-Step Authorization Check
    if not MaterialService.check_access_permission(material, current_user):
        raise HTTPException(status_code=403, detail="Bạn không có quyền tải tập tin này.")

    # Check allow_download flag
    if not material.allow_download:
        user_role = current_user.role.name if current_user and current_user.role else "STUDENT"
        is_owner = current_user and current_user.id == material.author_id
        if user_role != "ADMIN" and not is_owner:
            raise HTTPException(status_code=403, detail="Tác giả không cho phép tải tập tin này về máy, chỉ hỗ trợ xem trực tuyến.")

    mat_file = None
    if file_id:
        mat_file = db.query(MaterialFile).filter(MaterialFile.id == file_id, MaterialFile.material_id == material_id).first()
    else:
        mat_file = db.query(MaterialFile).filter(MaterialFile.material_id == material_id).first()

    if not mat_file:
        raise HTTPException(status_code=404, detail="Tập tin đính kèm không tồn tại.")

    # Increment Atomic Counter & Log Download
    material.download_count += 1
    dl_log = MaterialDownload(
        material_id=material.id,
        file_id=mat_file.id,
        user_id=current_user.id if current_user else None,
        ip_address=request.client.host if request.client else None
    )
    db.add(dl_log)
    db.commit()

    file_path = storage.get_file_path_or_stream(mat_file.storage_path)
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=500, detail="Tập tin không tìm thấy trên hệ thống lưu trữ.")

    return FileResponse(
        path=file_path,
        filename=mat_file.original_name,
        media_type=mat_file.mime_type
    )

@router.put("/{material_id}", response_model=APIResponse)
def update_material(
    material_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    course_code: Optional[str] = Form(None),
    academic_year: Optional[str] = Form(None),
    semester: Optional[int] = Form(None),
    faculty: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    access_level: Optional[str] = Form(None),
    allow_download: Optional[bool] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage: BaseStorageProvider = Depends(get_storage_provider)
):
    material = db.query(Material).filter(Material.id == material_id, Material.is_deleted == False).first()
    if not material:
        raise HTTPException(status_code=404, detail="Học liệu không tồn tại.")

    user_role = current_user.role.name if current_user.role else "STUDENT"
    if user_role != "ADMIN" and material.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không phải tác giả học liệu này.")

    if user_role != "ADMIN" and material.approval_status not in ["DRAFT", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Chỉ có thể chỉnh sửa học liệu ở trạng thái BẢN NHÁP hoặc BỊ TỪ CHỐI.")

    mat_in = MaterialUpdate(
        title=title,
        description=description,
        subject=subject,
        course_code=course_code,
        academic_year=academic_year,
        semester=semester,
        faculty=faculty,
        language=language,
        category_id=category_id,
        access_level=access_level,
        allow_download=allow_download
    )

    updated_material = MaterialService.update_material(db, material, mat_in, file, storage)
    return APIResponse(
        message="Cập nhật học liệu thành công.",
        data={"id": updated_material.id, "approval_status": updated_material.approval_status}
    )

@router.delete("/{material_id}", response_model=APIResponse)
def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    material = db.query(Material).filter(Material.id == material_id, Material.is_deleted == False).first()
    if not material:
        raise HTTPException(status_code=404, detail="Học liệu không tồn tại.")

    user_role = current_user.role.name if current_user.role else "STUDENT"
    if user_role != "ADMIN" and material.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa học liệu này.")

    material.is_deleted = True
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="MATERIAL_DELETE",
        target_entity="Material",
        target_id=material.id,
        details={"title": material.title}
    )
    db.add(audit)
    db.commit()

    return APIResponse(message="Xóa học liệu thành công (Soft Delete).")

@router.post("/{material_id}/favorite", response_model=APIResponse)
def toggle_favorite(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    material = db.query(Material).filter(Material.id == material_id, Material.is_deleted == False).first()
    if not material:
        raise HTTPException(status_code=404, detail="Học liệu không tồn tại.")

    fav = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.material_id == material_id).first()
    if fav:
        db.delete(fav)
        db.commit()
        return APIResponse(message="Đã xóa khỏi danh sách yêu thích.", data={"is_favorite": False})
    else:
        new_fav = Favorite(user_id=current_user.id, material_id=material_id)
        db.add(new_fav)
        db.commit()
        return APIResponse(message="Đã thêm vào danh sách yêu thích.", data={"is_favorite": True})
