import pandas as pd

def extract_csv_text(filepath: str) -> str:
    """Extract all text from a CSV file as a string using pandas."""
    try:
        df = pd.read_csv(filepath)
        return df.to_string()
    except Exception as e:
        print(f"CSV extraction error: {e}")
        return '' 