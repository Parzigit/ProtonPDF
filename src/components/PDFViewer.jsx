"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { ZoomIn, ZoomOut, Maximize, Minimize, RotateCw, Download, ChevronLeft, ChevronRight } from "lucide-react"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`

const docOptions = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
}

export default function PDFViewer({ fileUrl, goToPage, onToggleFullscreen }) {
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [layoutMode, setLayoutMode] = useState("single")
  const [fitMode, setFitMode] = useState("custom")
  const [pageWidth, setPageWidth] = useState(null)
  const [pageHeight, setPageHeight] = useState(null)

  // Spacebar panning
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const scrollStartRef = useRef({ left: 0, top: 0 })
  const mousePosRef = useRef({ x: 0, y: 0 })

  const containerRef = useRef(null)
  const documentRef = useRef(null)
  const resizeTimerRef = useRef(null)

  // ─── Navigate to page from external source (AI references) ───
  useEffect(() => {
    if (goToPage && numPages && goToPage >= 1 && goToPage <= numPages) {
      setCurrentPage(goToPage)
    }
  }, [goToPage, numPages])

  // ─── Spacebar hold for pan ───
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "Space" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault()
        setIsSpacePressed(true)
      }
    }
    const onKeyUp = (e) => {
      if (e.code === "Space") {
        setIsSpacePressed(false)
        setIsDragging(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  // ─── Mouse handlers (pan only when Space held) ───
  const handleMouseDown = (e) => {
    if (!isSpacePressed) return
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    if (containerRef.current) {
      scrollStartRef.current = {
        left: containerRef.current.scrollLeft,
        top: containerRef.current.scrollTop,
      }
    }
  }

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    if (isDragging && isSpacePressed && containerRef.current) {
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      containerRef.current.scrollLeft = scrollStartRef.current.left - dx
      containerRef.current.scrollTop = scrollStartRef.current.top - dy
    }
  }

  const handleMouseUpOrLeave = () => setIsDragging(false)

  // ─── Scale calculation ───
  // Key fix: use clientWidth/clientHeight (which EXCLUDE scrollbar) to prevent the infinite loop.
  // When "Fit Height" is selected, the page fits exactly into the visible area,
  // so no scroll bar appears, so the container size stays stable.
  const calculateScale = useCallback(() => {
    if (!containerRef.current || !pageWidth || !pageHeight) return null

    const container = containerRef.current
    const cw = container.clientWidth - 60
    const ch = container.clientHeight - 60

    // Guard: container not rendered yet
    if (cw <= 0 || ch <= 0) return null

    const effWidth = layoutMode === "double" ? pageWidth * 2 + 20 : pageWidth

    switch (fitMode) {
      case "width":  return cw / effWidth
      case "height": return ch / pageHeight
      case "page":   return Math.min(cw / effWidth, ch / pageHeight)
      default:       return null // custom — don't override
    }
  }, [pageWidth, pageHeight, fitMode, layoutMode])

  // Recalculate scale when fitMode, layout, or page dimensions change
  useEffect(() => {
    if (fitMode !== "custom") {
      // Small delay to ensure the container has rendered with proper dimensions
      const timer = setTimeout(() => {
        const s = calculateScale()
        if (s !== null && s > 0) setScale(s)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [calculateScale, fitMode, layoutMode, pageWidth, pageHeight])

  // Debounced ResizeObserver — only fires after window resize settles (300ms)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleResize = () => {
      clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = setTimeout(() => {
        if (fitMode !== "custom") {
          const s = calculateScale()
          if (s !== null && s > 0) setScale(s)
        }
      }, 300)
    }

    const ro = new ResizeObserver(handleResize)
    ro.observe(container)
    return () => {
      ro.disconnect()
      clearTimeout(resizeTimerRef.current)
    }
  }, [calculateScale, fitMode])

  // ─── Zoom helpers ───
  const zoomToCursor = (newScale) => {
    const container = containerRef.current
    if (!container) { setScale(newScale); return }
    const oldScale = scale
    const mp = mousePosRef.current
    const cx = container.scrollLeft + mp.x
    const cy = container.scrollTop + mp.y
    setScale(newScale)
    requestAnimationFrame(() => {
      const r = newScale / oldScale
      container.scrollLeft = cx * r - mp.x
      container.scrollTop  = cy * r - mp.y
    })
  }
  const zoomIn = () => { setFitMode("custom"); zoomToCursor(Math.min(scale * 1.25, 5.0)) }
  const zoomOut = () => { setFitMode("custom"); zoomToCursor(Math.max(scale / 1.25, 0.25)) }
  const resetZoom = () => setFitMode("width")

  // ─── Zoom input handlers (removed legacy handlers) ───

  // ─── Page navigation ───
  const maxPage = layoutMode === "double" && numPages ? (numPages % 2 === 0 ? numPages - 1 : numPages) : numPages || 1
  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - (layoutMode === "double" ? 2 : 1)))
  const goToNextPage = () => setCurrentPage((p) => Math.min(maxPage, p + (layoutMode === "double" ? 2 : 1)))

  // ─── Fullscreen ───
  const toggleFullscreen = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen()
      return
    }
    if (!document.fullscreenElement) {
      documentRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }
  useEffect(() => {
    const cb = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", cb)
    return () => document.removeEventListener("fullscreenchange", cb)
  }, [])

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const onKey = (e) => {
      switch (e.key) {
        case "ArrowLeft":  e.preventDefault(); goToPrevPage(); break
        case "ArrowRight": e.preventDefault(); goToNextPage(); break
        case "=": case "+": if (e.ctrlKey||e.metaKey) { e.preventDefault(); zoomIn() } break
        case "-":           if (e.ctrlKey||e.metaKey) { e.preventDefault(); zoomOut() } break
        case "0":           if (e.ctrlKey||e.metaKey) { e.preventDefault(); resetZoom() } break
        case "F11":         e.preventDefault(); toggleFullscreen(); break
        default: break
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, currentPage, numPages, layoutMode])

  // ─── Ctrl+Scroll zoom ───
  useEffect(() => {
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        setFitMode("custom")
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        zoomToCursor(Math.max(0.25, Math.min(5.0, scale + delta)))
      }
    }
    document.addEventListener("wheel", onWheel, { passive: false })
    return () => document.removeEventListener("wheel", onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale])

  // ─── Document/page load ───
  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages)
  const onPageLoadSuccess = (page) => {
    if (!pageWidth || !pageHeight) {
      setPageWidth(page.width)
      setPageHeight(page.height)
    }
  }

  // ─── Render pages ───
  const renderPages = () => {
    if (!numPages) return null
    const pageClass = "shadow-2xl"
    // Force a high pixel ratio for extremely crisp rendering of text and formulas
    const pixelRatio = Math.max(window.devicePixelRatio || 1, 2)
    const pages = []

    if (layoutMode === "single") {
      pages.push(
        <Page key={`p_${currentPage}`} pageNumber={currentPage} scale={scale} devicePixelRatio={pixelRatio}
          rotate={rotation} onLoadSuccess={onPageLoadSuccess}
          renderAnnotationLayer={true} renderTextLayer={true} className={pageClass} />
      )
    } else {
      pages.push(
        <Page key={`p_${currentPage}`} pageNumber={currentPage} scale={scale} devicePixelRatio={pixelRatio}
          rotate={rotation} onLoadSuccess={onPageLoadSuccess}
          renderAnnotationLayer={true} renderTextLayer={true} className={pageClass} />
      )
      if (currentPage + 1 <= numPages) {
        pages.push(
          <Page key={`p_${currentPage + 1}`} pageNumber={currentPage + 1} scale={scale} devicePixelRatio={pixelRatio}
            rotate={rotation} renderAnnotationLayer={true} renderTextLayer={true}
            className={`${pageClass} ml-4`} />
        )
      }
    }
    return pages
  }

  return (
    <div
      ref={documentRef}
      className={`flex-1 min-h-0 w-full flex flex-col bg-[#525659] relative ${isFullscreen ? "bg-[#1a1a1a]" : ""}`}
    >
      {/* ─── Top toolbar ─── */}
      <div className="bg-[#323232] text-white px-4 py-2 flex items-center justify-between border-b border-black/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Layout toggle */}
          <div className="flex bg-black/20 rounded-md overflow-hidden">
            <button onClick={() => setLayoutMode("single")}
              className={`px-3 py-1 text-xs font-medium ${layoutMode === "single" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
              Single
            </button>
            <button onClick={() => setLayoutMode("double")}
              className={`px-3 py-1 text-xs font-medium ${layoutMode === "double" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
              Double
            </button>
          </div>

          <div className="w-px h-4 bg-white/15" />

          {/* Fit mode */}
          <select value={fitMode} onChange={(e) => setFitMode(e.target.value)}
            className="bg-transparent text-xs text-gray-300 border-none focus:outline-none cursor-pointer hover:text-white">
            <option value="width" className="bg-[#323232]">Fit Width</option>
            <option value="height" className="bg-[#323232]">Fit Height</option>
            <option value="page" className="bg-[#323232]">Fit Page</option>
            <option value="custom" className="bg-[#323232]">Custom</option>
          </select>

          <div className="w-px h-4 bg-white/15" />

          {/* Zoom controls */}
          <button onClick={zoomOut} className="p-1 text-gray-400 hover:text-white rounded transition-colors" title="Zoom Out">
            <ZoomOut size={15} />
          </button>
          <span className="text-xs text-gray-300 w-10 text-center tabular-nums">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-1 text-gray-400 hover:text-white rounded transition-colors" title="Zoom In">
            <ZoomIn size={15} />
          </button>

          <div className="w-px h-4 bg-white/15" />

          <button onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1 text-gray-400 hover:text-white rounded transition-colors" title="Rotate">
            <RotateCw size={15} />
          </button>
        </div>

        {/* Right side — page nav + actions */}
        <div className="flex items-center gap-3">
          <button onClick={goToPrevPage} disabled={currentPage === 1}
            className="p-1 text-gray-400 hover:text-white rounded disabled:opacity-30 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-gray-300 tabular-nums">
            {currentPage}{layoutMode === "double" && currentPage + 1 <= (numPages || 0) ? `–${currentPage + 1}` : ""} / {numPages || 0}
          </span>
          <button onClick={goToNextPage} disabled={currentPage >= maxPage}
            className="p-1 text-gray-400 hover:text-white rounded disabled:opacity-30 transition-colors">
            <ChevronRight size={16} />
          </button>

          <div className="w-px h-4 bg-white/15" />

          <button onClick={toggleFullscreen}
            className="p-1 text-gray-400 hover:text-white rounded transition-colors" title="Fullscreen">
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
          <a href={fileUrl} download className="p-1 text-gray-400 hover:text-white rounded transition-colors" title="Download">
            <Download size={15} />
          </a>
        </div>
      </div>

      {/* ─── PDF canvas area ─── */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-auto"
        style={{
          background: "#525659",
          cursor: isSpacePressed ? (isDragging ? "grabbing" : "grab") : "auto",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {/* 
          The inner wrapper uses min-w/min-h 100% so that when the page is SMALLER than the viewport,
          flexbox centers it. When the page is LARGER, the div bounds safely relying on margin auto.
          This explicitly avoids Flexbox's infamous `justify-content: center` overflow clipping bug!
        */}
        <div style={{ minWidth: "100%", minHeight: "100%", display: "flex", padding: "30px" }}>
          <div style={{ margin: "auto" }}>
            <Document
              file={fileUrl}
              options={docOptions}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="text-white text-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3" />
                  Loading PDF…
                </div>
              }
              error={<div className="text-red-400 text-center py-20">Failed to load PDF. Please try again.</div>}
            >
              <div className={`flex ${layoutMode === "double" ? "gap-4" : ""} justify-center items-start`}>
                {renderPages()}
              </div>
            </Document>
          </div>
        </div>
      </div>
    </div>
  )
}
