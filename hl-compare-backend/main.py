from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from compare import process_documents, compare_entities
import os
from typing import List
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="HL Compare API", description="Investment comparison platform")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create docs folder if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/files", StaticFiles(directory="uploads"), name="files")

@app.get("/")
async def root():
    return {"message": "HL Compare API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "HL Compare API is operational"}

@app.post("/compare/")
async def compare_entities_endpoint(
    files: List[UploadFile] = File(...),
    entityA: str = Form(...),
    entityB: str = Form(...),
    query: str = Form("Compare these entities across all available metrics")
):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    if not entityA or not entityB:
        raise HTTPException(status_code=400, detail="Both entities must be specified")
    
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
        comparison_result = compare_entities(doc_summaries, entityA, entityB, query, doc_metadata)
        
        # Extract only the comparison categories (exclude document_analysis and executive_summary)
        comparison_categories = {}
        categories = [
            "investment_thesis", "valuation_metrics", "financial_performance", 
            "competitive_position", "risk_factors", "growth_drivers", 
            "macro_context", "esg_factors", "management_quality", "portfolio_recommendation"
        ]
        
        for category in categories:
            if category in comparison_result:
                comparison_categories[category] = comparison_result[category]
        
        return JSONResponse(content={
            "entityA": entityA,
            "entityB": entityB,
            "documents_analyzed": len(file_paths),
            "comparison": comparison_categories
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
