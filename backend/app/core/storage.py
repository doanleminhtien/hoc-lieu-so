import os
import shutil
import uuid
from abc import ABC, abstractmethod
from typing import BinaryIO, Tuple
from app.core.config import settings

class BaseStorageProvider(ABC):
    @abstractmethod
    def save_file(self, file_obj: BinaryIO, original_filename: str) -> Tuple[str, str]:
        """Save file and return tuple of (stored_filename, storage_path)"""
        pass

    @abstractmethod
    def delete_file(self, storage_path: str) -> bool:
        """Delete file from storage"""
        pass

    @abstractmethod
    def get_file_path_or_stream(self, storage_path: str):
        """Get file path or stream for reading"""
        pass

    @abstractmethod
    def file_exists(self, storage_path: str) -> bool:
        """Check if file exists"""
        pass

class LocalStorageProvider(BaseStorageProvider):
    def __init__(self, base_dir: str = settings.LOCAL_STORAGE_DIR):
        self.base_dir = os.path.abspath(base_dir)
        os.makedirs(self.base_dir, exist_ok=True)

    def save_file(self, file_obj: BinaryIO, original_filename: str) -> Tuple[str, str]:
        ext = os.path.splitext(original_filename)[1].lower()
        unique_name = f"{uuid.uuid4().hex}{ext}"
        storage_path = os.path.join(self.base_dir, unique_name)
        
        with open(storage_path, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)
            
        return unique_name, storage_path

    def delete_file(self, storage_path: str) -> bool:
        if os.path.exists(storage_path):
            os.remove(storage_path)
            return True
        return False

    def get_file_path_or_stream(self, storage_path: str):
        if os.path.exists(storage_path):
            return storage_path
        return None

    def file_exists(self, storage_path: str) -> bool:
        return os.path.exists(storage_path)

class CloudinaryStorageProvider(BaseStorageProvider):
    def __init__(self):
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET
        )
        self.uploader = cloudinary.uploader

    def save_file(self, file_obj: BinaryIO, original_filename: str) -> Tuple[str, str]:
        response = self.uploader.upload(file_obj, resource_type="auto")
        url = response.get("secure_url")
        public_id = response.get("public_id")
        return public_id, url

    def delete_file(self, storage_path: str) -> bool:
        response = self.uploader.destroy(storage_path)
        return response.get("result") == "ok"

    def get_file_path_or_stream(self, storage_path: str):
        return storage_path

    def file_exists(self, storage_path: str) -> bool:
        return True

def get_storage_provider() -> BaseStorageProvider:
    if settings.STORAGE_PROVIDER == "cloudinary":
        return CloudinaryStorageProvider()
    return LocalStorageProvider()
