def extract_txt_text(filepath: str) -> str:
    """Extract all text from a TXT file."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except Exception as e:
        print(f"TXT extraction error: {e}")
        return '' 