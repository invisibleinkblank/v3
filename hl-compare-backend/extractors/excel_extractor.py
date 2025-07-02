import pandas as pd

def extract_excel_text(filepath: str) -> str:
    """Extract all text from an Excel file as a string using pandas."""
    try:
        df = pd.read_excel(filepath)
        return df.to_string()
    except Exception as e:
        print(f"Excel extraction error: {e}")
        return '' 