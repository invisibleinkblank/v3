from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from compare import process_documents, compare_entities
import os
from typing import List
from fastapi.staticfiles import StaticFiles
import shutil

from database import get_db, User, File as DBFile, Comparison
from schemas import UserCreate, UserOut, Token, CompareResponse
from auth import register_user, authenticate_user, create_access_token
from analysis import compare_entities
from utils import save_upload_file

app = FastAPI(title="HL Compare API", description="Production-ready investment comparison backend")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create docs folder if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/files", StaticFiles(directory="uploads"), name="files")

@app.post("/register", response_model=UserOut, tags=["auth"])
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    return register_user(user, db)

@app.post("/login", response_model=Token, tags=["auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/compare/", response_model=CompareResponse, tags=["compare"])
def compare(
    files: List[UploadFile] = File(...),
    entities: str = Form(...),
    db: Session = Depends(get_db)
):
    """Upload files and compare entities. Returns structured JSON for frontend. (No auth required)"""
    entity_list = [e.strip() for e in entities.split(",") if e.strip()]
    if len(entity_list) < 2:
        raise HTTPException(status_code=400, detail="At least two entities must be specified")
    filepaths = []
    for upload_file in files:
        fp = save_upload_file(upload_file, UPLOAD_DIR)
        db_file = DBFile(filename=upload_file.filename, path=fp)
        db.add(db_file)
        filepaths.append(fp)
    db.commit()
    result = compare_entities(filepaths, entity_list)
    db_result = Comparison(result_json=str(result))
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return result

@app.get("/results/{comparison_id}", tags=["compare"])
def get_result(comparison_id: int, db: Session = Depends(get_db)):
    """Retrieve a past comparison result by ID."""
    db_result = db.query(Comparison).filter(Comparison.id == comparison_id).first()
    if not db_result:
        raise HTTPException(status_code=404, detail="Result not found")
    return db_result.result_json

@app.get("/", tags=["health"])
def root():
    return {"message": "HL Compare API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "HL Compare API is operational"}

@app.post("/compare/")
async def compare_entities_endpoint(
    files: List[UploadFile] = File(...),
    entities: str = Form(None),
    entityA: str = Form(None),
    entityB: str = Form(None),
    query: str = Form("Compare these entities across all available metrics")
):
    print(f"[DEBUG] Received form fields: entities={entities}, entityA={entityA}, entityB={entityB}, files={[f.filename for f in files]}")
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    # Parse entities list
    entity_list = []
    if entities:
        entity_list = [e.strip() for e in entities.split(",") if e.strip()]
    elif entityA and entityB:
        entity_list = [entityA, entityB]
    else:
        raise HTTPException(status_code=400, detail="At least two entities must be specified")
    if len(entity_list) < 2:
        raise HTTPException(status_code=400, detail="At least two entities must be specified")
    
    try:
        # Save uploaded files
        file_paths = []
        for file in files:
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            file_paths.append(file_path)
        
        # Process documents and generate comparison
        doc_metadata = [{"filename": os.path.basename(fp), "size": os.path.getsize(fp)} for fp in file_paths]
        doc_summaries = process_documents(file_paths, doc_metadata)
        
        # Generate analysis for all entities
        comparison = {}
        categories = [
            "investment_thesis", "valuation_metrics", "financial_performance",
            "competitive_position", "risk_factors", "growth_drivers",
            "macro_context", "esg_factors", "management_quality", "portfolio_recommendation"
        ]
        for category in categories:
            comparison[category] = {}
            for entity in entity_list:
                try:
                    result = compare_entities(doc_summaries, entity, query, doc_metadata)
                    if not result or not isinstance(result, dict):
                        raise Exception()
                    comparison[category][entity.lower().strip()] = result
                except Exception:
                    comparison[category][entity.lower().strip()] = {"analysis": "", "confidence": 0, "key_facts": {}}
        
        return JSONResponse(content={
            "comparison": comparison,
            "documents_analyzed": len(file_paths),
            "entities": entity_list
        })
        
    except Exception as e:
        print(f"Error in comparison: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")

@app.post("/documents/summary")
async def get_document_summary(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    try:
        # Save uploaded files
        file_paths = []
        for file in files:
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            file_paths.append(file_path)
        
        # Process documents
        doc_summaries = process_documents(file_paths)
        
        return JSONResponse(content={
            "documents_processed": len(file_paths),
            "summaries": doc_summaries
        })
        
    except Exception as e:
        print(f"Error in document processing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
