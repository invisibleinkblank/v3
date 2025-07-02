import os
import io
from typing import List, Dict, Any

import pandas as pd
from PyPDF2 import PdfReader

# --- File Extraction Utilities ---
def extract_text_from_file(filepath: str) -> str:
    """
    Extracts text from a file, dispatching to the correct extractor based on file extension.
    Supports PDF, TXT, CSV, XLSX, and more.
    """
    ext = os.path.splitext(filepath)[1].lower()
    if ext == '.pdf':
        try:
            reader = PdfReader(filepath)
            return "\n".join(page.extract_text() or '' for page in reader.pages)
        except Exception:
            return ''
    elif ext in ['.txt', '.md']:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    elif ext in ['.csv', '.tsv']:
        try:
            df = pd.read_csv(filepath) if ext == '.csv' else pd.read_csv(filepath, sep='\t')
            return df.to_string()
        except Exception:
            return ''
    elif ext in ['.xls', '.xlsx']:
        try:
            df = pd.read_excel(filepath)
            return df.to_string()
        except Exception:
            return ''
    else:
        return ''  # Unsupported file type for now

# --- Entity & Metric Extraction (Stub) ---
def extract_entities_and_metrics(text: str, entities: List[str]) -> Dict[str, Dict[str, Any]]:
    """
    Given raw text and a list of entities, extract metrics for each entity.
    This is a stub: replace with real NLP/regex/ML logic as needed.
    Returns: { entity: { category: {metric: value, ...}, ... }, ... }
    """
    # TODO: Implement real extraction logic
    results = {}
    for entity in entities:
        results[entity] = {
            'investment_thesis': {},
            'valuation_metrics': {},
            'financial_performance': {},
            'competitive_position': {},
            'risk_factors': {},
            'growth_drivers': {},
            'macro_context': {},
            'esg_factors': {},
            'management_quality': {},
            'portfolio_recommendation': {}
        }
    return results

# --- Main Comparison Logic ---
def compare_entities_universal(filepaths: List[str], entities: List[str]) -> Dict[str, Any]:
    """
    Main entry point: processes all files, extracts text, aggregates metrics by entity.
    Returns a structured JSON for the frontend.
    """
    all_text = ''
    for fp in filepaths:
        all_text += extract_text_from_file(fp) + '\n'
    entity_metrics = extract_entities_and_metrics(all_text, entities)
    # Structure response for frontend
    comparison = {}
    for category in [
        'investment_thesis', 'valuation_metrics', 'financial_performance',
        'competitive_position', 'risk_factors', 'growth_drivers',
        'macro_context', 'esg_factors', 'management_quality', 'portfolio_recommendation']:
        comparison[category] = {entity: entity_metrics[entity][category] for entity in entities}
    return {
        'comparison': comparison,
        'documents_analyzed': len(filepaths),
        'entities': entities
    }

# --- Example FastAPI Endpoint (commented for integration) ---
'''
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import shutil

app = FastAPI()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/compare/")
async def compare_endpoint(files: List[UploadFile] = File(...), entities: str = Form(...)):
    entity_list = [e.strip() for e in entities.split(",") if e.strip()]
    filepaths = []
    for file in files:
        fp = os.path.join(UPLOAD_DIR, file.filename)
        with open(fp, "wb") as out:
            shutil.copyfileobj(file.file, out)
        filepaths.append(fp)
    result = compare_entities_universal(filepaths, entity_list)
    return JSONResponse(content=result)
''' 