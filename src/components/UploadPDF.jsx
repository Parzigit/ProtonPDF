"use client"
import { useState } from "react";
import axios from "axios";
//error handling
import { Upload, FileText, Loader}from "lucide-react"
export default function UploadPDF({ setJobId }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const handleUpload = async () => {
    setError("")
    if (!file) {
      setError("Please select a PDF file.")
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await axios.post("http://localhost:8000/upload", formData)
      setJobId(res.data.job_id)
    } catch (err) {
      setError("Upload failed. Check backend or CORS.")
    }
    setLoading(false)
  }

  const handleFileSelect = (selectedFile) => {
    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return
    }
    setFile(selectedFile)
    setError("")
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
          ${loading ? "opacity-50 pointer-events-none" : "hover:border-gray-400"}
        `}
      >
        {loading ? (
          <div className="flex flex-col items-center">
            <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Uploading PDF...</p>
          </div>
        ) : (
          <>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload your PDF</h3>
            <p className="text-gray-500 mb-4">
              {file ? `Selected: ${file.name}` : "Drag and drop your PDF file here, or click to browse"}
            </p>

            <div className="space-y-3">
              <label className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0]
                    if (selectedFile) handleFileSelect(selectedFile)
                  }}
                  className="hidden"
                />
              </label>

              {file && (
                <button
                  className="block w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload PDF"}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
