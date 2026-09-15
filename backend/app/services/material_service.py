import os
import re
from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from fastapi import HTTPException, UploadFile, status

from app.models import (
    Material, MaterialFile, Category, Tag, material_tags,
    User, AccessPermission, MaterialView, MaterialDownload, Favorite, Notification, AuditLog
)
from app.schemas.schemas import MaterialCreate, MaterialUpdate
from app.core.storage import BaseStorageProvider

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text

class MaterialService:
    @staticmethod
    def create_material(
        db: Session,
        material_in: MaterialCreate,
        author_id: int,
        file: Optional[UploadFile],
        storage: BaseStorageProvider
    ) -> Material:
        category = db.query(Category).filter(Category.id == material_in.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Danh mục không tồn tại.")
            
        base_slug = slugify(material_in.title)
        slug = f"{base_slug}-{int(datetime.utcnow().timestamp())}"

        new_material = Material(
            title=material_in.title,
            slug=slug,
            description=material_in.description,
            subject=material_in.subject,
            course_code=material_in.course_code,
            academic_year=material_in.academic_year,
            semester=material_in.semester,
            faculty=material_in.faculty,
            language=material_in.language or "vi",
            category_id=material_in.category_id,
            author_id=author_id,
            access_level=material_in.access_level or "PUBLIC",
            allow_download=material_in.allow_download if material_in.allow_download is not None else True,
            approval_status="DRAFT"
        )
        db.add(new_material)
        db.flush()

        # Handle Tags
        if material_in.tags:
            for tag_name in material_in.tags:
                tag_name_clean = tag_name.strip()
                if tag_name_clean:
                    tag_slug = slugify(tag_name_clean)
                    tag = db.query(Tag).filter(Tag.slug == tag_slug).first()
                    if not tag:
                        tag = Tag(name=tag_name_clean, slug=tag_slug)
                        db.add(tag)
                        db.flush()
                    new_material.tags.append(tag)

        # Handle File Upload
        if file:
            # Validate File Extension & Size
            allowed_exts = {".pdf", ".docx", ".doc", ".pptx", ".ppt", ".xlsx", ".xls", ".zip", ".jpg", ".png"}
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in allowed_exts:
                raise HTTPException(status_code=400, detail=f"Định dạng file '{ext}' không được hỗ trợ.")
                
            # Magic Bytes Validation
            header = file.file.read(10)
            file.file.seek(0)
            
            # PDF magic bytes: %PDF
            if ext == ".pdf" and not header.startswith(b"%PDF"):
                raise HTTPException(status_code=400, detail="Tập tin PDF không hợp lệ hoặc bị lỗi cấu trúc (Magic bytes mismatch).")
            # ZIP / DOCX / PPTX / XLSX magic bytes: PK\x03\x04
            if ext in [".zip", ".docx", ".pptx", ".xlsx"] and not header.startswith(b"PK\x03\x04"):
                raise HTTPException(status_code=400, detail="Tập tin nén/Office không hợp lệ (Magic bytes mismatch).")
            # PNG magic bytes: \x89PNG
            if ext == ".png" and not header.startswith(b"\x89PNG"):
                raise HTTPException(status_code=400, detail="Tập tin hình ảnh PNG không hợp lệ.")
            # JPG magic bytes: \xff\xd8\xff
            if ext in [".jpg", ".jpeg"] and not header.startswith(b"\xff\xd8\xff"):
                raise HTTPException(status_code=400, detail="Tập tin hình ảnh JPG không hợp lệ.")

            stored_name, storage_path = storage.save_file(file.file, file.filename)
            
            # File size calculation
            file.file.seek(0, os.SEEK_END)
            file_size = file.file.tell()
            file.file.seek(0)
            
            mat_file = MaterialFile(
                material_id=new_material.id,
                original_name=file.filename,
                stored_name=stored_name,
                storage_path=storage_path,
                file_size=file_size,
                mime_type=file.content_type or "application/octet-stream",
                file_extension=ext
            )
            db.add(mat_file)

        db.commit()
        db.refresh(new_material)
        return new_material

    @staticmethod
    def submit_for_approval(db: Session, material_id: int, user_id: int, user_role: str) -> Material:
        material = db.query(Material).filter(Material.id == material_id, Material.is_deleted == False).first()
        if not material:
            raise HTTPException(status_code=404, detail="Học liệu không tồn tại.")
            
        if user_role != "ADMIN" and material.author_id != user_id:
            raise HTTPException(status_code=403, detail="Bạn không phải tác giả học liệu này.")
            
        if material.approval_status not in ["DRAFT", "REJECTED"]:
            raise HTTPException(status_code=400, detail=f"Không thể gửi duyệt học liệu ở trạng thái '{material.approval_status}'.")
            
        material.approval_status = "PENDING_APPROVAL"
        material.rejection_reason = None
        db.commit()
        db.refresh(material)
        return material

    @staticmethod
    def approve_material(db: Session, material_id: int, admin_id: int) -> Material:
        material = db.query(Material).filter(Material.id == material_id, Material.is_deleted == False).first()
        if not material:
            raise HTTPException(status_code=404, detail="Học liệu không tồn tại.")
            
        if material.approval_status != "PENDING_APPROVAL":
            raise HTTPException(status_code=400, detail="Chỉ học liệu đang chờ duyệt mới có thể phê duyệt.")
            
        material.approval_status = "PUBLISHED" # Approved auto publish
        material.published_at = datetime.utcnow()
        
        # Notify Lecturer
        notif = Notification(
            user_id=material.author_id,
            title="Học liệu đã được duyệt",
            message=f"Học liệu '{material.title}' của bạn đã được Admin phê duyệt và xuất bản.",
            type="APPROVAL"
        )
        db.add(notif)
        
        # Audit Log
        audit = AuditLog(
            user_id=admin_id,
            action="MATERIAL_APPROVE",
            target_entity="Material",
            target_id=material.id,
            details={"title": material.title}
        )
        db.add(audit)

        db.commit()
        db.refresh(material)
        return material

    @staticmethod
    def reject_material(db: Session, material_id: int, admin_id: int, reason: str) -> Material:
        if not reason or not reason.strip():
            raise HTTPException(status_code=422, detail="Cần cung cấp lý do từ chối học liệu.")

        material = db.query(Material).filter(Material.id == material_id, Material.is_deleted == False).first()
        if not material:
            raise HTTPException(status_code=404, detail="Học liệu không tồn tại.")

        if material.approval_status != "PENDING_APPROVAL":
            raise HTTPException(status_code=400, detail="Chỉ học liệu đang chờ duyệt mới có thể từ chối.")

        material.approval_status = "REJECTED"
        material.rejection_reason = reason

        # Notify Lecturer
        notif = Notification(
            user_id=material.author_id,
            title="Học liệu bị từ chối",
            message=f"Học liệu '{material.title}' bị từ chối với lý do: {reason}",
            type="REJECT"
        )
        db.add(notif)

        # Audit Log
        audit = AuditLog(
            user_id=admin_id,
            action="MATERIAL_REJECT",
            target_entity="Material",
            target_id=material.id,
            details={"title": material.title, "reason": reason}
        )
        db.add(audit)

        db.commit()
        db.refresh(material)
        return material

    @staticmethod
    def update_material(
        db: Session,
        material: Material,
        mat_in: MaterialUpdate,
        file: Optional[UploadFile],
        storage: BaseStorageProvider
    ) -> Material:
        for field, value in mat_in.dict(exclude_unset=True).items():
            if field != "tags" and value is not None:
                setattr(material, field, value)

        if mat_in.tags is not None:
            material.tags.clear()
            for tag_name in mat_in.tags:
                tag_name_clean = tag_name.strip()
                if tag_name_clean:
                    tag_slug = slugify(tag_name_clean)
                    tag = db.query(Tag).filter(Tag.slug == tag_slug).first()
                    if not tag:
                        tag = Tag(name=tag_name_clean, slug=tag_slug)
                        db.add(tag)
                        db.flush()
                    material.tags.append(tag)

        # Handle File Replacement if provided
        if file:
            allowed_exts = {".pdf", ".docx", ".doc", ".pptx", ".ppt", ".xlsx", ".xls", ".zip", ".jpg", ".png"}
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in allowed_exts:
                raise HTTPException(status_code=400, detail=f"Định dạng file '{ext}' không được hỗ trợ.")

            stored_name, storage_path = storage.save_file(file.file, file.filename)
            file.file.seek(0, os.SEEK_END)
            file_size = file.file.tell()
            file.file.seek(0)

            # Remove old file records
            db.query(MaterialFile).filter(MaterialFile.material_id == material.id).delete()

            mat_file = MaterialFile(
                material_id=material.id,
                original_name=file.filename,
                stored_name=stored_name,
                storage_path=storage_path,
                file_size=file_size,
                mime_type=file.content_type or "application/octet-stream",
                file_extension=ext
            )
            db.add(mat_file)

        # Reset REJECTED status back to DRAFT for resubmission
        if material.approval_status == "REJECTED":
            material.approval_status = "DRAFT"
            material.rejection_reason = None

        material.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(material)
        return material

    @staticmethod
    def check_access_permission(material: Material, user: Optional[User]) -> bool:
        """9-Step Authorization Check Protocol"""
        if material.is_deleted:
            return False
            
        # Admin can view all
        if user and user.role and user.role.name == "ADMIN":
            return True
            
        # Owner can view all
        if user and user.id == material.author_id:
            return True

        # Non-owners can only view PUBLISHED materials
        if material.approval_status != "PUBLISHED":
            return False

        # Access level check
        if material.access_level == "PUBLIC":
            return True
            
        if material.access_level == "AUTHENTICATED":
            return user is not None
            
        if material.access_level == "ROLE_BASED":
            if not user or not user.role:
                return False
            # Check explicit role permission
            perm = any(p.granted_role_id == user.role_id for p in material.permissions)
            return perm or user.role.name in ["LECTURER", "ADMIN"]
            
        if material.access_level == "PRIVATE":
            if not user:
                return False
            perm = any(p.granted_user_id == user.id for p in material.permissions)
            return perm

        return False
