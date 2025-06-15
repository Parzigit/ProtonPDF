import { useState } from "react";
import axios from "axios";
//error handling
export default function UploadPDF({ setJobId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    setError("");
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("http://localhost:8000/upload", formData);
      setJobId(res.data.job_id);
    } catch (err) {
      setError("Upload failed. Check backend or CORS.");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-white rounded shadow flex flex-col items-center gap-4">
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
