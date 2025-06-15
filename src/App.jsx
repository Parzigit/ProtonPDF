import { useState } from "react";
import UploadPDF from "./components/UploadPDF";
import PDFViewer from "./components/PDFViewer";
import FloatingChatbot from "./components/FloatingChatBot";

export default function App() {
  const [jobId, setJobId] = useState(null);
  const fileUrl = jobId ? `http://localhost:8000/pdf/${jobId}` : null;

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      <h1 className="text-3xl font-bold text-center py-8">ProtonPDF</h1>
      {!jobId ? (
        <div className="flex-1 flex justify-center items-center">
          <UploadPDF setJobId={setJobId} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative w-full h-[calc(100vh-4rem)]">
          <div className="absolute inset-0 flex flex-col">
            <PDFViewer fileUrl={fileUrl} />
          </div>
          <FloatingChatbot jobId={jobId} />
        </div>
      )}
    </div>
  );
}
