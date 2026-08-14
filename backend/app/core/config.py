import os
from typing import List, Union
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
    
    DATABASE_URL: str = "sqlite:///./digital_materials.db"
    
    STORAGE_PROVIDER: str = "local" # 'local' or 'cloudinary'
    LOCAL_STORAGE_DIR: str = "./uploads"
    
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
