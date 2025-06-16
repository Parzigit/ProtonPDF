"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { ZoomIn, ZoomOut, Maximize, Minimize, RotateCw, Download, ChevronLeft, ChevronRight } from "lucide-react"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`

export default function PDFViewer({ fileUrl }) {
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [layoutMode, setLayoutMode] = useState("single")
  const [fitMode, setFitMode] = useState("width")
  const [pageWidth, setPageWidth] = useState(null)
  const [pageHeight, setPageHeight] = useState(null)

  const containerRef = useRef(null)
  const documentRef = useRef(null)
  const calculateScale = useCallback(() => {
    if (!containerRef.current || !pageWidth || !pageHeight) return 1.0

    const container = containerRef.current
    const containerWidth = container.clientWidth - 40
    const containerHeight = container.clientHeight - 40

    switch (fitMode) {
      case "width":
        return containerWidth / pageWidth
      case "height":
        return containerHeight / pageHeight
      case "page":
        const scaleX = containerWidth / pageWidth
        const scaleY = containerHeight / pageHeight
        return Math.min(scaleX, scaleY)
      default:
        return scale
    }
  }, [pageWidth, pageHeight, fitMode, scale])

  useEffect(() => {
    if (fitMode !== "custom") {
      const newScale = calculateScale()
      setScale(newScale)
    }
  }, [calculateScale, fitMode])

  useEffect(() => {
    const handleResize = () => {
      if (fitMode !== "custom") {
        const newScale = calculateScale()
        setScale(newScale)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [calculateScale, fitMode])
  useEffect(() => {
  if (containerRef.current) {
    const container = containerRef.current
    container.scrollLeft = container.scrollWidth / 2 - container.clientWidth / 2
  }
}, [scale])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      documentRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const zoomIn = () => {
    setFitMode("custom")
    setScale((prev) => Math.min(prev * 1.25, 5.0))
  }

  const zoomOut = () => {
    setFitMode("custom")
    setScale((prev) => Math.max(prev / 1.25, 0.25))
  }

  const resetZoom = () => {
    setFitMode("width")
  }
  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - (layoutMode === "double" ? 2 : 1)))
  }

  const goToNextPage = () => {
    const maxPage = layoutMode === "double" && numPages ? (numPages % 2 === 0 ? numPages - 1 : numPages) : numPages || 1
    setCurrentPage((prev) => Math.min(maxPage, prev + (layoutMode === "double" ? 2 : 1)))
  }
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isZoomedIn = scale > 1.1

      switch (e.key) {
        case "ArrowLeft":
          if (isZoomedIn && containerRef.current) {
            containerRef.current.scrollLeft -= 50
          } else {
            goToPrevPage()
          }
          break
        case "ArrowRight":
          if (isZoomedIn && containerRef.current) {
            containerRef.current.scrollLeft += 50
          } else {
            goToNextPage()
          }
          break
        case "ArrowUp":
          if (isZoomedIn && containerRef.current) {
            containerRef.current.scrollTop -= 50
          }
          break
        case "ArrowDown":
          if (isZoomedIn && containerRef.current) {
            containerRef.current.scrollTop += 50
          }
          break
        case "=":
        case "+":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            zoomIn()
          }
          break
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            zoomOut()
          }
          break
        case "0":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            resetZoom()
          }
          break
        case "F11":
          e.preventDefault()
          toggleFullscreen()
          break
        default:
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [scale])
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setFitMode("custom")
        setScale((prev) => Math.max(0.25, Math.min(5.0, prev + delta)))
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
      return () => container.removeEventListener("wheel", handleWheel)
    }
  }, [])

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const onPageLoadSuccess = (page) => {
    if (!pageWidth || !pageHeight) {
      const { width, height } = page
      setPageWidth(width)
      setPageHeight(height)
    }
  }

  const renderPages = () => {
    if (!numPages) return null

    const pages = []

    if (layoutMode === "single") {
      pages.push(
        <Page
          key={`page_${currentPage}`}
          pageNumber={currentPage}
          scale={scale}
          rotate={rotation}
          onLoadSuccess={onPageLoadSuccess}
          renderAnnotationLayer={true}
          renderTextLayer={true}
          className="shadow-lg border border-gray-300"
        />,
      )
    } else {
      pages.push(
        <Page
          key={`page_${currentPage}`}
          pageNumber={currentPage}
          scale={scale}
          rotate={rotation}
          onLoadSuccess={onPageLoadSuccess}
          renderAnnotationLayer={true}
          renderTextLayer={true}
          className="shadow-lg border border-gray-300"
        />,
      )

      if (currentPage + 1 <= numPages) {
        pages.push(
          <Page
            key={`page_${currentPage + 1}`}
            pageNumber={currentPage + 1}
            scale={scale}
            rotate={rotation}
            renderAnnotationLayer={true}
            renderTextLayer={true}
            className="shadow-lg border border-gray-300 ml-4"
          />,
        )
      }
    }

    return pages
  }

  const maxPage = layoutMode === "double" && numPages ? (numPages % 2 === 0 ? numPages - 1 : numPages) : numPages || 1

  return (
    <div
      ref={documentRef}
      className={`w-full h-full flex flex-col bg-gray-900 ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
    >
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          {/* Layout Controls */}
          <div className="flex gap-1 mr-4">
            <button
              onClick={() => setLayoutMode("single")}
              className={`px-3 py-1 rounded text-sm ${
                layoutMode === "single" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setLayoutMode("double")}
              className={`px-3 py-1 rounded text-sm ${
                layoutMode === "double" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Double
            </button>
          </div>
          <select
            value={fitMode}
            onChange={(e) => setFitMode(e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm border border-gray-600"
          >
            <option value="width">Fit Width</option>
            <option value="height">Fit Height</option>
            <option value="page">Fit Page</option>
            <option value="custom">Custom</option>
          </select>
          <div className="flex items-center gap-1 ml-4">
            <button onClick={zoomOut} className="p-1 hover:bg-gray-700 rounded" title="Zoom Out">
              <ZoomOut size={16} />
            </button>
            <span className="text-sm min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="p-1 hover:bg-gray-700 rounded" title="Zoom In">
              <ZoomIn size={16} />
            </button>
          </div>
          <button
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="p-1 hover:bg-gray-700 rounded ml-2"
            title="Rotate"
          >
            <RotateCw size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="p-1 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => {
                const page = Number.parseInt(e.target.value)
                if (page >= 1 && page <= maxPage) {
                  setCurrentPage(page)
                }
              }}
              className="w-16 px-2 py-1 bg-gray-700 text-white text-center rounded text-sm border border-gray-600"
              min={1}
              max={maxPage}
            />
            <span className="text-sm text-gray-300">of {numPages || 0}</span>
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= maxPage}
            className="p-1 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleFullscreen} className="p-1 hover:bg-gray-700 rounded" title="Fullscreen (F11)">
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          <a href={fileUrl} download className="p-1 hover:bg-gray-700 rounded" title="Download">
            <Download size={16} />
          </a>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-600 px-4 py-4">
        <div className="flex justify-center items-center min-h-full">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                Loading PDF...
              </div>
            }
            error={<div className="text-red-400 text-center">Failed to load PDF. Please try again.</div>}
          >
            <div className={`flex ${layoutMode === "double" ? "gap-4" : ""}`}>
              {renderPages()}
            </div>
          </Document>
        </div>
      </div>
      <div className="bg-gray-800 text-gray-300 px-4 py-1 text-xs border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span>
            Page {currentPage}
            {layoutMode === "double" && currentPage + 1 <= (numPages || 0) && `-${currentPage + 1}`} of {numPages || 0}{" "}
            • {Math.round(scale * 100)}%
          </span>
          <span>
            {scale > 1.1 ? "Arrow keys to pan • Ctrl+scroll to zoom" : "Arrow keys to navigate • Ctrl+scroll to zoom"}
          </span>
        </div>
      </div>
    </div>
  )
}
