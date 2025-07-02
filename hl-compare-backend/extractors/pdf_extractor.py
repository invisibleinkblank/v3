import PyPDF2

def extract_pdf_text(filepath: str) -> str:
    """Extract all text from a PDF file using PyPDF2."""
    try:
        with open(filepath, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            return "\n".join(page.extract_text() or '' for page in reader.pages)
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return '' 