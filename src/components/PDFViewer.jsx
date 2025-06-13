import { useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
// import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

export default function PDFViewer({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative h-full w-full overflow-auto bg-gray-50 p-4 rounded-lg shadow-md">
      <div className="sticky top-0 z-10 flex justify-between items-center bg-white p-2 mb-2 border-b">
        <h2 className="text-lg font-medium">PDF Viewer</h2>
        {numPages && (
          <span className="text-sm text-gray-600">
            Page {1} of {numPages}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Failed to load PDF: {error.message}
        </div>
      )}

      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
          setLoading(false);
        }}
        onLoadError={(error) => {
          setError(error);
          setLoading(false);
        }}
        loading={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }
      >
        {Array.from({ length: numPages || 0 }, (_, index) => (
          <div key={index} className="mb-4 bg-white p-2 rounded shadow">
            <Page
              pageNumber={index + 1}
              width={Math.min(800, window.innerWidth - 40)}
              renderAnnotationLayer={true}
              renderTextLayer={true}
            />
          </div>
        ))}
      </Document>
    </div>
  );
}
