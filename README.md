# Portfolio AI

Welcome to Portfolio AI — a modern portfolio experience that combines a polished personal website with an AI-powered assistant for exploring projects, skills, and professional background.

This project is designed to help visitors learn about the portfolio owner in an interactive, engaging way while also making it easy to explore supporting documents, profile details, and context-rich conversations.

## Overview

Portfolio AI includes:

- A responsive frontend built with Next.js
- A FastAPI backend for portfolio data and chat workflows
- An AI-powered assistant that responds using portfolio context and uploaded documents
- A document-aware workspace for exploring profile information and supporting materials
- A clean, visitor-friendly presentation for showcasing work and experience

## Features

- Interactive portfolio dashboard and profile presentation
- AI chat experience grounded in portfolio context
- Support for backend-managed portfolio documents and user uploads
- Dynamic workspace UI for browsing project information and related materials
- Fast, modern frontend/backend stack for local development and extension

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Python, FastAPI
- AI integration: Groq-backed LLM responses
- State and data handling: React Query, Zustand, typed portfolio models

## Project Structure

```text
Portfolio-ai/
├── backend/
│   ├── app/
│   │   ├── data/
│   │   ├── models/
│   │   ├── services/
│   │   └── main.py
│   ├── requirements.txt
│   ├── requirements-runtime.txt
│   └── README.md
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   └── README.md
├── README.md
└── .gitignore
```

## Prerequisites

Before running the project locally, make sure you have:

- Python 3.10+ installed
- Node.js 18+ or newer
- npm installed
- A Groq API key for the AI-powered backend responses

## Getting Started

### 1. Set up the backend

From the backend folder, create and activate a virtual environment if needed, then install dependencies:

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install -r requirements.txt
```

Then set your Groq API key in your environment:

```bash
set GROQ_API_KEY=your_api_key_here
```

Start the API:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend will be available at:

- http://127.0.0.1:8000
- Health check: http://127.0.0.1:8000/health

### 2. Set up the frontend

Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Then open:

- http://localhost:3000

## How it Works

The frontend presents the portfolio content and interactive workspace, while the backend powers the AI chat and document features. The app loads portfolio information, connects relevant knowledge sources, and uses the configured language model to answer visitor questions based on the available context.

## Visitor Experience

Visitors can:

- Explore the portfolio overview and profile information
- Ask questions in a conversational AI assistant
- Browse portfolio-related workspace materials
- Review structured content and supporting documents without leaving the site

## Customization

To tailor the experience to a different person or brand:

- Update portfolio data in the backend data files
- Adjust the frontend content and styling in the app components
- Add or remove system documents used as conversation context
- Update the portfolio schema and metadata as needed

## Documentation

Additional project-specific setup notes are available in:

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)

## License

This project is currently for portfolio and demonstration purposes. Add a license file if you plan to share or distribute it publicly.

## Contact

If you want to connect, collaborate, or learn more, feel free to reach out through the portfolio contact details or the project’s published contact channels.

Thank you for visiting Portfolio AI.
