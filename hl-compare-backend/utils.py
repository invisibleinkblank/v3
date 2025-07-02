import os
from fastapi import UploadFile

def save_upload_file(upload_file: UploadFile, upload_dir: str) -> str:
    """Save an uploaded file to the upload_dir and return the file path."""
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, upload_file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(upload_file.file.read())
    return file_path 