import { useState } from "react";
import axios from "axios";

export default function FloatingChatbot({ jobId }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/ask", {
        params: { job_id: jobId, question },
      });
      setResponse(res.data.answer);
    } catch {
      setResponse("Sorry, something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      {!open && (
        <div
          className="flex items-center justify-center bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:scale-105"
          onClick={() => setOpen(true)}
          onMouseEnter={() => setOpen(true)}
        >
          <span className="font-semibold">Ask AI</span>
        </div>
      )}
      {open && (
        <div
          className="w-auto bg-white rounded-t-2xl rounded-b-lg shadow-2xl p-4 flex flex-col items-center animate-slideup"
          style={{ minHeight: 120 }}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="w-full flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">Ask AI about this PDF</span>
            <button
              className="text-gray-400 hover:text-gray-800"
              onClick={() => setOpen(false)}
              title="Close"
            >
              ×
            </button>
          </div>
          <textarea
            rows={2}
            className="w-full border rounded p-2 mb-2"
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 w-full"
            onClick={handleAsk}
            disabled={loading}
          >
            {loading ? "Asking..." : "Ask AI"}
          </button>
          {response && (
            <div className="mt-3 w-full bg-gray-100 p-2 rounded text-gray-800 text-sm max-h-32 overflow-auto">
              {response}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
