import { useState } from "react";
import axios from "axios";

export default function UploadPDF({ setJobId }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("http://localhost:8000/upload", formData);
    setJobId(res.data.job_id);
  };

  return (
    <div className="p-4 flex items-center gap-4">
      <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
}
