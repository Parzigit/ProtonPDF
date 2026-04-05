# ProtonPDF
ProtonPDF is a PDF reader that lets users upload, view, and chat using an AI chatbot. Powered by React tools and TinyLlama/TinyLlama-1.1B-Chat-v1.0 LLM, it contextualizes the understanding of documents without reading them fully.

## Features

- Upload any PDF document
- View documents using pdf-reader 
- Light-weight questions with an AI model.


## Tech Stack

### Frontend
- ReactJS + Tailwind CSS
- React-PDF for rendering documents
- Axios for API calls

### Backend
- Python (FastAPI / Flask)
- Redis (Sub/Pub for real-time requests)
- FAISS for vec search
- TinyLlama a very light weight model for chat (can be updated later)


## Folder Structure 
    protonpdf/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── UploadPDF.jsx
    │   │   ├── PDFViewer.jsx
    │   │   └── AIChatBox.jsx
    │   ├── App.jsx
    │   └── index.js
    ├── .gitignore
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── README.md


## Install Dependencies 
npm install (Or download from requirements.txt )

## To run the App
npm start

"Can,
Integrate a larger LLM (e.g., LLaMA 3)"

