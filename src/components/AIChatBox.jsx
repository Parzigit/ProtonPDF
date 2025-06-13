import { useState } from "react";
import axios from "axios";

export default function AIChatBox({ jobId }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  const handleAsk = async () => {
    const res = await axios.get("http://localhost:8000/ask", {
      params: { job_id: jobId, question },
    });
    setResponse(res.data.answer);
  };

  return (
    <div className="p-4 border-t">
      <textarea
        rows="2"
        className="w-full border p-2 rounded mb-2"
        placeholder="Ask something about this PDF..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleAsk}>
        Ask AI
      </button>
      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded shadow">{response}</div>
      )}
    </div>
  );
}
