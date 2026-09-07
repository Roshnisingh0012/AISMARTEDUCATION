import io
from pypdf import PdfReader
import docx

def parse_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    text = []
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text.append(extracted)
    return "\n".join(text)

def parse_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    text = [paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()]
    return "\n".join(text)

def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    text = ""
    if filename.lower().endswith(".pdf"):
        text = parse_pdf(file_bytes)
    elif filename.lower().endswith(".docx"):
        text = parse_docx(file_bytes)
    else:
        raise ValueError("Unsupported file format. Only PDF and DOCX are allowed.")
    
    # Clean up whitespace
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)
