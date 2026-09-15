import os
from typing import List, Union, Optional
from pydantic import Field, AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Digital Material Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "digital_learning_material_super_secret_jwt_key_graduation_thesis_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    STORAGE_PROVIDER: str = "local" # 'local' or 'cloudinary'
    LOCAL_STORAGE_DIR: str = "./uploads"
    
    # PostgreSQL Configuration (Mandatory - No SQLite Fallback)
    POSTGRES_SERVER: Optional[str] = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_USER: Optional[str] = "postgres"
    POSTGRES_PASSWORD: Optional[str] = "postgres"
    POSTGRES_DB: Optional[str] = "digital_materials"
    
    DATABASE_URL: Optional[str] = None

    @property
    def ASSEMBLED_DATABASE_URL(self) -> str:
        if self.DATABASE_URL and (self.DATABASE_URL.startswith("postgresql://") or self.DATABASE_URL.startswith("postgres://")):
            url = self.DATABASE_URL.strip()
            return url.replace("postgres://", "postgresql://", 1)
        if self.POSTGRES_SERVER and self.POSTGRES_USER and self.POSTGRES_PASSWORD and self.POSTGRES_DB:
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        raise RuntimeError("Dự án yêu cầu kết nối PostgreSQL làm Database duy nhất. Vui lòng cấu hình các biến POSTGRES_SERVER, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB trong file .env.")

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
