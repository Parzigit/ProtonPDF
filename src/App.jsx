import { useState } from "react";
import UploadPDF from "./components/UploadPDF";
import PDFViewer from "./components/PDFViewer";
import AIChatBox from "./components/AIChatBox";

function App() {
  const [jobId, setJobId] = useState(null);

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-center mb-6">ProtonPDF</h1>
      <UploadPDF setJobId={setJobId} />
      {jobId && (
        <>
          <PDFViewer fileUrl={`http://localhost:8000/pdf/${jobId}`} />
          <AIChatBox jobId={jobId} />
        </>
      )}
    </div>
  );
}

export default App;
