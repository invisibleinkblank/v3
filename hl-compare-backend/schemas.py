from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    created_at: datetime
    class Config:
        from_attributes = True

class FileOut(BaseModel):
    id: int
    filename: str
    path: str
    uploaded_at: datetime
    class Config:
        from_attributes = True

class ComparisonOut(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    result_json: Dict[str, Any]
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class CompareRequest(BaseModel):
    entities: List[str]
    # files are handled via multipart/form-data

class CompareResponse(BaseModel):
    comparison: Dict[str, Any]
    documents_analyzed: int
    entities: List[str] 