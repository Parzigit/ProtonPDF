<div align="left">
  <h1>
    <img src="https://github.com/user-attachments/assets/37925847-4c3d-4e1c-9e7c-6be7daee9571" alt="ProtonPDF Logo" width="150" height="100" align="absmiddle" style="margin-right: 15px;" />
  </h1>
  <p><b>Proton is an AI-powered document reader paired with a fully-featured, strictly private PDF utility toolkit.</b></p>
</div>
</div>

## Overview

ProtonPDF is an all-in-one document workspace designed as a modern alternative to tools like Adobe Acrobat and iLovePDF, but with cutting edge AI capabilities baked natively into the interface. 

The application is split into two primary engines:
1. **The AI Reader**: A split-screen document viewer with a persistent, context-aware AI assistant powered by Groq and Llama-3. Simply upload a document, and the AI acts as an instant study-buddy, summarizing pages, answering questions, and extracting data in real-time.
2. **The PDF Toolkit**: A suite of 17+ document utilities (Merge, Split, Compress, Watermark, etc.). 

The Toolkit operates on a **zero-storage, in-memory ByteStream architecture**. Documents are processed entirely in RAM on the backend and streamed directly back to the user.

---

## ✨ Features

*   **Lightning-fast LLM Inference**: Powered by the Groq API (Llama 3 70B/8B).
*   **Context-Aware Chat**: Ask questions directly related to the PDF you are currently reading.
*   **Persistent Conversations**: Chat history is persistently saved to the database.

Includes 17 highly optimized, RAM-only PDF utilities:
*   **Compress PDF**: Aggressive size reduction with 4 adjustable quality levels (includes image downsampling).
*   **Split & Merge**: Extract specific page ranges or stitch multiple documents together.
*   **Format Conversions**: Convert PDF to high-quality Images (PNG), Word (`.docx`), Excel (`.xlsx`), and turn JPG/PNGs into PDFs.
*   **Security**: Apply AES-256 password protection, or unlock existing documents.
*   **Markup & Editing**: Add highly-customizable watermarks, redact sensitive text, crop margins, and insert page numbers.
*   **Utilities**: Extract embedded images, repair corrupted documents, rotate pages, and freely reorganize page ordering.

## 📸 Screenshots

### AI Reader Interface 
<img width="1915" height="985" alt="image" src="https://github.com/user-attachments/assets/eee682fc-4d36-4fc3-a9f3-97c91a648725" /> 

### Upload Dashboard 
<img width="642" height="688" alt="image" src="https://github.com/user-attachments/assets/746ce4ac-7a68-45e2-a7d2-38cc9da3a464" />

### Option Configuration 
<img width="1154" height="907" alt="image" src="https://github.com/user-attachments/assets/d25a61cd-b7cc-42d2-b456-2b5e06e5b09c" />

---

## Technology Stack

**Frontend**
*   **React** (Create React App / Vite)
*   **TailwindCSS** for rapid, responsive styling
*   **Lucide React** for ultra-clean iconography
*   **React-PDF** / Embedded Object rendering

**Backend**
*   **FastAPI** (Python 3) for blazing-fast asynchronous endpoints
*   **PyMuPDF** (`fitz`) for low-level, high-performance document manipulation
*   **Groq API** + `llama3-70b-8192` for AI responses
*   **SQLite** for minimalist, portable user and chat history storage
*   **PyJWT** & **Google OAuth 2.0** for secure authentication

---

## Local Installation

Want to run ProtonPDF on your own machine? Follow these steps:

### Prerequisites
*   Node.js (`v18` or higher)
*   Python (`3.9` or higher)
*   A free API key from [Groq](https://console.groq.com/)
*   A Google OAuth Client ID for authentication

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/ProtonPDF.git
cd ProtonPDF
```

### 2. Backend Setup
```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment Setup
# Create a .env file in the backend directory and add:
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=super_secret_string_change_me
DB_PATH=./data/protonpdf.db
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:3000

# Start the FastAPI server
python -m uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd protonpdf

npm install

REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_API_URL=http://localhost:8000

npm start
```
The application will now be running live at `http://localhost:3000`!
---

## 🤝 Contributions are Welcomed!

If you want to help expand ProtonPDF, contributions are wide open. 

**Areas:**
1.   Integrating advanced open-source OCR engines (e.g. Tesseract) for scanned documents.
2.   Creating a visual PDF-to-Word structural reflow algorithm.
3.   UI enhancements and accessibility improvements.
---
