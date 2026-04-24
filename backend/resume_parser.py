import PyPDF2
import io

async def extract_resume_text(file):
    content = await file.read()

    if file.filename.lower().endswith(".pdf"):
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""

        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

        return text.strip()

    return content.decode("utf-8", errors="ignore")
