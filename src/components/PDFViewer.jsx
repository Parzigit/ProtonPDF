import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

export default function PDFViewer({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [layoutMode, setLayoutMode] = useState("single"); 
  const [splitMode, setSplitMode] = useState("none");
  const [currentPage, setCurrentPage] = useState(1);
  const getPageWidth = () => {
    const base = Math.min(1200, window.innerWidth - 100);
    if (splitMode === "none") return base;
    if (splitMode === "horizontal") return base / 2 - 16;
    if (splitMode === "vertical") return base;
    return base;
  };
  const maxPage = () => {
    if (!numPages) return 1;
    if (layoutMode === "single") return numPages;
    return numPages % 2 === 0 ? numPages - 1 : numPages;
  };
  const goPrev = () => {
    setCurrentPage((prev) => Math.max(1, prev - (layoutMode === "double" ? 2 : 1)));
  };
  const goNext = () => {
    setCurrentPage((prev) => Math.min(maxPage(), prev + (layoutMode === "double" ? 2 : 1)));
  };
  useEffect(() => {
    if (currentPage > maxPage()) setCurrentPage(maxPage());
  }, [numPages, layoutMode]);
  const renderPages = () => {
    if (!numPages) return null;
    if (layoutMode === "single") {
      return (
        <Page
          key={currentPage}
          pageNumber={currentPage}
          width={getPageWidth()}
          renderAnnotationLayer
          renderTextLayer
          className="shadow-lg rounded"
        />
      );
    } else {
      const pages = [
        <Page
          key={currentPage}
          pageNumber={currentPage}
          width={getPageWidth()}
          renderAnnotationLayer
          renderTextLayer
          className="shadow-lg rounded"
        />,
      ];
      if (currentPage + 1 <= numPages) {
        pages.push(
          <Page
            key={currentPage + 1}
            pageNumber={currentPage + 1}
            width={getPageWidth()}
            renderAnnotationLayer
            renderTextLayer
            className="shadow-lg rounded"
          />
        );
      }
      return pages;
    }
  };
  const renderSplit = () => {
    if (splitMode === "none") {
      return (
        <div className="flex justify-center items-center w-full h-full">
          {renderPages()}
        </div>
      );
    }
    if (splitMode === "horizontal") {
      return (
        <div className="flex flex-row gap-4 justify-center items-center w-full h-full">
          {renderPages()}
        </div>
      );
    }
    if (splitMode === "vertical") {
      return (
        <div className="flex flex-col gap-4 justify-center items-center w-full h-full">
          {renderPages()}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between bg-white border-b px-4 py-2">
        <div className="flex gap-2">
          <button
            onClick={() => setLayoutMode("single")}
            className={`px-3 py-1 rounded-md ${layoutMode === "single" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
          >
            Single
          </button>
          <button
            onClick={() => setLayoutMode("double")}
            className={`px-3 py-1 rounded-md ${layoutMode === "double" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
          >
            Two Pages
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={splitMode}
            onChange={(e) => setSplitMode(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="none">No Split</option>
            <option value="horizontal">Horizontal Split</option>
            <option value="vertical">Vertical Split</option>
          </select>
          <span className="ml-4">
            Page {currentPage}
            {layoutMode === "double" && currentPage + 1 <= numPages
              ? `-${currentPage + 1}`
              : ""}
            {" "}of {numPages || 0}
          </span>
          <button
            onClick={goPrev}
            disabled={currentPage === 1}
            className="ml-2 px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={goNext}
            disabled={currentPage >= maxPage()}
            className="ml-2 px-2 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-50 flex justify-center items-center">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div>Loading PDF...</div>}
        >
          {renderSplit()}
        </Document>
      </div>
    </div>
  );
}
