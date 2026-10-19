# Backend

## Setup

From this directory, install the application dependencies and start FastAPI:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-runtime.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Set `GROQ_API_KEY` in the backend environment before starting the service.

For deployment, set `FRONTEND_ORIGINS` on the backend to a comma-separated list
of exact browser origins, such as the Vercel production domain and any custom
domain (scheme and host only, with no path). The single-origin
`FRONTEND_ORIGIN` setting remains supported. Set `NEXT_PUBLIC_API_URL` in the
frontend deployment to the backend's public base URL so the browser requests
the deployed API instead of `localhost`.

## System Sources

`app/data/portfolio.json` is always listed as a system document and supplied
to the assistant. Add additional backend-managed `.pdf`, `.txt`, `.md`, or
`.json` sources under `app/data/system_documents/`. They appear in the
workspace and are included as profile context in chat. PDFs must contain
selectable text; scanned image-only PDFs are not OCR-processed.

## Visitor Uploads

The upload endpoint extracts text from PDF, TXT, Markdown, and JSON files.
Visitor uploads are held in backend memory only, limited to 12 MB and 10 PDF
pages, and expire after 30 minutes of inactivity. Backend-managed system PDFs
retain a separate 100-page limit. The frontend sends an upload's ID
only to chat nodes connected to that document. Uploaded job descriptions are
treated as role requirements, not as evidence about Om.