"use client";
import { useState, useCallback } from "react";
import api from "../api";
import { Upload, FileText, Loader, CheckCircle, AlertCircle } from "lucide-react";

export default function UploadPDF({ setJobId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null); // null | "uploading" | "processing" | "done" | "error"
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const pollStatus = useCallback(
    async (jobId) => {
      setProcessingStatus("processing");
      const maxAttempts = 120;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const res = await api.get(`/status/${jobId}`);
          if (res.data.status === "done") {
            setProcessingStatus("done");
            setTimeout(() => setJobId(jobId), 800);
            return;
          }
          if (res.data.status === "failed") {
            setProcessingStatus("error");
            setError(res.data.error || "Processing failed");
            return;
          }
        } catch {
          // Ignore polling errors
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      setProcessingStatus("error");
      setError("Processing timed out. Please try again.");
    },
    [setJobId]
  );

  const handleUpload = async () => {
    setError("");
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }
    setLoading(true);
    setProcessingStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData);
      const jobId = res.data.job_id;
      setLoading(false);
      await pollStatus(jobId);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
      setProcessingStatus("error");
      setLoading(false);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }
    setFile(selectedFile);
    setError("");
    setProcessingStatus(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const statusIcon = () => {
    switch (processingStatus) {
      case "uploading":
        return <Loader className="w-6 h-6 text-violet-400 animate-spin" />;
      case "processing":
        return <Loader className="w-6 h-6 text-blue-400 animate-spin" />;
      case "done":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      default:
        return null;
    }
  };

  const statusText = () => {
    switch (processingStatus) {
      case "uploading":
        return "Uploading your PDF...";
      case "processing":
        return "Analyzing and indexing document...";
      case "done":
        return "Ready! Opening PDF viewer...";
      case "error":
        return error;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        className={`
          relative rounded-2xl p-10 text-center transition-all duration-300
          border-2 border-dashed backdrop-blur-sm
          ${isDragging
            ? "border-violet-400 bg-violet-500/10 scale-[1.02]"
            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
          }
          ${loading || processingStatus === "processing" ? "opacity-70 pointer-events-none" : ""}
        `}
      >
        {!processingStatus ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-5">
              <FileText className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Upload your PDF
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              {file
                ? file.name
                : "Drag and drop your PDF file here, or click to browse"}
            </p>

            <div className="flex flex-col items-center gap-3">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/15 cursor-pointer transition-colors text-sm font-medium">
                <Upload className="w-4 h-4" />
                Choose File
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                  className="hidden"
                />
              </label>

              {file && (
                <button
                  className="w-full max-w-xs px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl
                             font-semibold shadow-lg shadow-violet-600/25
                             hover:shadow-violet-600/40 hover:scale-[1.02]
                             active:scale-[0.98] transition-all duration-200"
                  onClick={handleUpload}
                  disabled={loading}
                >
                  Analyze with AI
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            {statusIcon()}
            <p className={`text-sm font-medium ${processingStatus === "error" ? "text-red-400" : processingStatus === "done" ? "text-green-400" : "text-gray-300"}`}>
              {statusText()}
            </p>
            {processingStatus === "processing" && (
              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full animate-progress" />
              </div>
            )}
            {processingStatus === "error" && (
              <button
                onClick={() => {
                  setProcessingStatus(null);
                  setError("");
                  setFile(null);
                }}
                className="text-violet-400 hover:text-violet-300 text-sm underline"
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
