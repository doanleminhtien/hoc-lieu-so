from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import User, Role
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse

class AuthService:
    @staticmethod
    def register_user(db: Session, req: RegisterRequest) -> User:
        # Check existing user
        existing = db.query(User).filter(User.email == req.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email này đã được đăng ký trên hệ thống.")
        
        # Default role for public registration is STUDENT (id=3)
        student_role = db.query(Role).filter(Role.name == "STUDENT").first()
        if not student_role:
            raise HTTPException(status_code=500, detail="Cấu hình hệ thống chưa có Role STUDENT.")
            
        new_user = User(
            email=req.email,
            hashed_password=get_password_hash(req.password),
            full_name=req.full_name,
            user_code=req.user_code,
            faculty=req.faculty,
            role_id=student_role.id,
            is_active=True,
            is_blocked=False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate_user(db: Session, req: LoginRequest) -> TokenResponse:
        user = db.query(User).filter(User.email == req.email).first()
        if not user or not verify_password(req.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không chính xác.")
        
        if user.is_blocked:
            raise HTTPException(status_code=403, detail="Tài khoản của bạn đã bị khóa bởi Quản trị viên.")
            
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Tài khoản của bạn đang bị vô hiệu hóa.")
            
        role_name = user.role.name if user.role else "STUDENT"
        access_token = create_access_token(subject=user.id, role=role_name)
        refresh_token = create_refresh_token(subject=user.id, role=role_name)
        
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)

    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Refresh Token không hợp lệ hoặc đã hết hạn.")
            
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user or user.is_blocked:
            raise HTTPException(status_code=403, detail="Người dùng không khả dụng.")
            
        role_name = user.role.name
        new_access_token = create_access_token(subject=user.id, role=role_name)
        new_refresh_token = create_refresh_token(subject=user.id, role=role_name)
        
        return TokenResponse(access_token=new_access_token, refresh_token=new_refresh_token)
