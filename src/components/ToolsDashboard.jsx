import { useState, useRef, useEffect } from "react";
import {
  CopyPlus, Scissors, Image as ImageIcon, Lock, Unlock, RotateCw, Type,
  ChevronLeft, ChevronRight, Upload, Loader, Download, Sparkles,
  Minimize2, Hash, Images, ArrowUpDown, FileText, AlertCircle, CheckCircle,
  ImagePlus, Wrench, CropIcon, EyeOff, FileOutput, Table2, Clock
} from "lucide-react";
import api from "../api";

const TOOLS = [
  // ── Active tools ──
  { id: "merge", name: "Merge PDF", icon: <CopyPlus />, color: "from-blue-500 to-blue-600", desc: "Combine multiple PDFs into a single file.", multi: true },
  { id: "split", name: "Split PDF", icon: <Scissors />, color: "from-orange-500 to-amber-500", desc: "Extract specific pages into a new PDF." },
  { id: "compress", name: "Compress PDF", icon: <Minimize2 />, color: "from-emerald-500 to-green-600", desc: "Reduce file size with adjustable quality levels." },
  { id: "to-image", name: "PDF to Image", icon: <ImageIcon />, color: "from-purple-500 to-violet-600", desc: "Convert pages into high-quality PNG images." },
  { id: "to-word", name: "PDF to Word", icon: <FileOutput />, color: "from-blue-600 to-indigo-600", desc: "Convert PDF into editable DOCX documents." },
  { id: "to-excel", name: "PDF to Excel", icon: <Table2 />, color: "from-green-600 to-teal-600", desc: "Extract tables and data into XLSX spreadsheets." },
  { id: "jpg-to-pdf", name: "JPG to PDF", icon: <ImagePlus />, color: "from-amber-500 to-orange-500", desc: "Convert images (JPG, PNG) into PDF documents.", multi: true, acceptImages: true },
  { id: "protect", name: "Protect PDF", icon: <Lock />, color: "from-red-500 to-rose-600", desc: "Encrypt with AES-256 password security." },
  { id: "unlock", name: "Unlock PDF", icon: <Unlock />, color: "from-green-500 to-emerald-600", desc: "Remove password from encrypted PDFs." },
  { id: "rotate", name: "Rotate PDF", icon: <RotateCw />, color: "from-yellow-500 to-amber-500", desc: "Rotate pages by 90°, 180°, or 270°." },
  { id: "watermark", name: "Add Watermark", icon: <Type />, color: "from-pink-500 to-rose-500", desc: "Stamp custom text with position & style options." },
  { id: "page-numbers", name: "Page Numbers", icon: <Hash />, color: "from-cyan-500 to-teal-500", desc: "Add page numbers at any position." },
  { id: "crop", name: "Crop PDF", icon: <CropIcon />, color: "from-lime-500 to-green-500", desc: "Trim margins from PDF pages." },
  { id: "redact", name: "Redact PDF", icon: <EyeOff />, color: "from-gray-600 to-gray-700", desc: "Permanently black out sensitive text." },
  { id: "repair", name: "Repair PDF", icon: <Wrench />, color: "from-sky-500 to-blue-500", desc: "Fix corrupted or damaged PDF files." },
  { id: "extract-images", name: "Extract Images", icon: <Images />, color: "from-fuchsia-500 to-pink-600", desc: "Pull all embedded images from a PDF." },
  { id: "organize", name: "Organize Pages", icon: <ArrowUpDown />, color: "from-indigo-500 to-blue-600", desc: "Reorder or remove pages from a PDF." },
  // ── Coming soon ──
  { id: "sign", name: "Sign PDF", icon: <FileText />, color: "from-gray-500 to-gray-600", desc: "Add electronic signatures.", soon: true },
  { id: "compare", name: "Compare PDF", icon: <FileText />, color: "from-gray-500 to-gray-600", desc: "Side-by-side document comparison.", soon: true },
  { id: "ocr", name: "OCR PDF", icon: <FileText />, color: "from-gray-500 to-gray-600", desc: "Make scanned PDFs searchable.", soon: true },
];

export default function ToolsDashboard({ onBack, onOpenReader }) {
  const [activeTool, setActiveTool] = useState(null);

  if (activeTool) {
    return <ToolActionView tool={activeTool} onBack={() => setActiveTool(null)} />;
  }

  return (
    <div className="flex-1 w-full bg-[#0a0a0f] overflow-auto py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Proton PDF Toolkit</h1>
            <p className="text-gray-400 text-sm">Every PDF tool you need — free, private, and unlimited.</p>
          </div>
        </div>

        <button
          onClick={onOpenReader}
          className="w-full mb-8 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-2xl p-5 md:p-6 flex text-left items-center justify-between shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.01]"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">PDF AI Reader</h2>
              <p className="text-white/70 text-xs md:text-sm">Upload a document to chat, summarize, and extract data with AI.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 flex-shrink-0" />
        </button>

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">All Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => !tool.soon && setActiveTool(tool)}
              disabled={tool.soon}
              className={`group flex flex-col text-left bg-[#12121a] border border-white/[0.06] p-5 rounded-2xl transition-all duration-200 ${
                tool.soon ? "opacity-50 cursor-not-allowed" : "hover:border-white/[0.15] hover:bg-[#151520]"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md`}>
                  {tool.icon}
                </div>
                {tool.soon && (
                  <span className="flex items-center gap-1 text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                    <Clock size={10} /> Soon
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{tool.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{tool.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// Tool Action View
// ═══════════════════════════════════════════════════════════════════════════

function ToolActionView({ tool, onBack }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pageCount, setPageCount] = useState(null);
  const [loadingPageCount, setLoadingPageCount] = useState(false);
  const [compressionResult, setCompressionResult] = useState(null);
  const fileInputRef = useRef(null);

  // Tool params
  const [ranges, setRanges] = useState("");
  const [password, setPassword] = useState("");
  const [degrees, setDegrees] = useState("90");
  const [imagePages, setImagePages] = useState("1");
  const [imageDPI, setImageDPI] = useState("200");
  const [pageOrder, setPageOrder] = useState("");
  const [compressLevel, setCompressLevel] = useState("medium");

  // Watermark
  const [wmText, setWmText] = useState("CONFIDENTIAL");
  const [wmPosition, setWmPosition] = useState("center");
  const [wmFontsize, setWmFontsize] = useState("40");
  const [wmColor, setWmColor] = useState("gray");

  // Page numbers
  const [pnPosition, setPnPosition] = useState("bottom-center");
  const [pnStart, setPnStart] = useState("1");

  // Crop
  const [cropTop, setCropTop] = useState("0");
  const [cropBottom, setCropBottom] = useState("0");
  const [cropLeft, setCropLeft] = useState("0");
  const [cropRight, setCropRight] = useState("0");

  // Redact
  const [redactText, setRedactText] = useState("");

  // Fetch page count
  useEffect(() => {
    if (files.length === 0 || tool.multi) { setPageCount(null); return; }
    const file = files[0];
    if (!file.name.toLowerCase().endsWith(".pdf")) return;
    setLoadingPageCount(true);
    const fd = new FormData();
    fd.append("file", file);
    api.post("/tools/page-count", fd)
      .then(res => {
        setPageCount(res.data.pages);
        if (tool.id === "organize") {
          setPageOrder(Array.from({ length: res.data.pages }, (_, i) => i + 1).join(","));
        }
      })
      .catch(() => setPageCount(null))
      .finally(() => setLoadingPageCount(false));
  }, [files, tool.id, tool.multi]);

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    if (tool.multi) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    } else {
      setFiles([e.target.files[0]]);
    }
    setError(""); setSuccess(""); setCompressionResult(null);
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const executeTool = async () => {
    setError(""); setSuccess(""); setCompressionResult(null);
    if (files.length === 0) { setError("Please select at least one file."); return; }

    setLoading(true);
    try {
      const formData = new FormData();

      if (tool.id === "merge" || tool.id === "jpg-to-pdf") {
        files.forEach(f => formData.append("files", f));
      } else {
        formData.append("file", files[0]);
      }

      // Params
      if (tool.id === "split") formData.append("ranges", ranges || "1");
      if (tool.id === "compress") formData.append("level", compressLevel);
      if (tool.id === "to-image") {
        formData.append("pages", imagePages || "1");
        formData.append("quality", imageDPI || "200");
      }
      if (tool.id === "protect" || tool.id === "unlock") formData.append("password", password);
      if (tool.id === "rotate") formData.append("degrees", degrees || "90");
      if (tool.id === "watermark") {
        formData.append("text", wmText || "DRAFT");
        formData.append("position", wmPosition);
        formData.append("fontsize", wmFontsize);
        formData.append("color", wmColor);
      }
      if (tool.id === "page-numbers") {
        formData.append("position", pnPosition);
        formData.append("start_number", pnStart || "1");
      }
      if (tool.id === "crop") {
        formData.append("margin_top", cropTop || "0");
        formData.append("margin_bottom", cropBottom || "0");
        formData.append("margin_left", cropLeft || "0");
        formData.append("margin_right", cropRight || "0");
      }
      if (tool.id === "redact") formData.append("search_text", redactText);
      if (tool.id === "organize") formData.append("page_order", pageOrder);

      const response = await api.post(`/tools/${tool.id}`, formData, { responseType: "blob" });

      // Compression stats
      if (tool.id === "compress") {
        const origSize = parseInt(response.headers["x-original-size"] || "0");
        const compSize = parseInt(response.headers["x-compressed-size"] || "0");
        const reduction = response.headers["x-reduction"] || "0";
        setCompressionResult({ origSize, compSize, reduction });
      }

      // Trigger download
      const contentType = response.headers["content-type"] || "application/pdf";
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      let ext = "pdf";
      if (contentType.includes("png")) ext = "png";
      if (contentType.includes("zip")) ext = "zip";
      if (contentType.includes("wordprocessing")) ext = "docx";
      if (contentType.includes("spreadsheet")) ext = "xlsx";
      link.setAttribute("download", `${tool.id}_result.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess("Done! Your file has been downloaded.");
    } catch (err) {
      const detail = err.response?.data;
      if (detail instanceof Blob) {
        const text = await detail.text();
        try { setError(JSON.parse(text).detail || "Operation failed."); }
        catch { setError("Operation failed. Check your inputs."); }
      } else {
        setError(err.response?.data?.detail || "Operation failed. Check your inputs.");
      }
    } finally {
      setLoading(false);
    }
  };

  const acceptType = tool.acceptImages ? "image/*" : "application/pdf";

  return (
    <div className="flex-1 w-full bg-[#0a0a0f] overflow-auto pt-8 md:pt-12 px-4 md:px-6 pb-20">
      <div className="w-full max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm">
          <ChevronLeft size={16} /> Back to Tools
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-lg`}>
            {tool.icon}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{tool.name}</h1>
            <p className="text-gray-500 text-sm">{tool.desc}</p>
          </div>
        </div>

        <div className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-5 md:p-6 flex flex-col">
          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="mb-5 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {success}
            </div>
          )}
          {compressionResult && (
            <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-400 font-medium">Compression Complete</span>
                <span className="text-emerald-300 font-bold text-lg">-{compressionResult.reduction}%</span>
              </div>
              <div className="flex gap-4 text-xs text-gray-400">
                <span>Original: {(compressionResult.origSize / 1024).toFixed(0)} KB</span>
                <span>→</span>
                <span>Compressed: {(compressionResult.compSize / 1024).toFixed(0)} KB</span>
              </div>
            </div>
          )}

          {/* Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-violet-500/50 bg-white/[0.02] rounded-xl p-8 md:p-10 flex flex-col items-center justify-center cursor-pointer transition-colors mb-5"
          >
            <Upload size={28} className="text-gray-500 mb-3" />
            <p className="text-white font-medium text-sm mb-1">
              Click to select {tool.acceptImages ? "image" : "PDF"} file{tool.multi ? "s" : ""}
            </p>
            <p className="text-xs text-gray-500">
              {tool.multi ? "Select multiple files" : "Select a single file"}
            </p>
          </div>
          <input type="file" multiple={!!tool.multi} accept={acceptType} className="hidden" ref={fileInputRef} onChange={handleFileChange} />

          {/* Selected files */}
          {files.length > 0 && (
            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Selected Files</h4>
                {loadingPageCount && <Loader className="w-3 h-3 animate-spin text-violet-400" />}
                {pageCount !== null && (
                  <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-medium">
                    {pageCount} page{pageCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between bg-white/[0.04] px-4 py-2.5 rounded-lg text-sm">
                  <div className="flex items-center gap-2 text-gray-300 truncate">
                    <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-gray-600 text-xs flex-shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-300 text-xs ml-2 flex-shrink-0">Remove</button>
                </div>
              ))}
            </div>
          )}

          {/* ═══ TOOL PARAMETERS ═══ */}

          {tool.id === "split" && (
            <ParamSection label={`Page Ranges${pageCount ? ` (1–${pageCount})` : ""}`}>
              <input type="text" placeholder="e.g. 1-3, 5, 7-9" value={ranges} onChange={e => setRanges(e.target.value)} className="input-field" />
            </ParamSection>
          )}

          {tool.id === "compress" && (
            <ParamSection label="Compression Level">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  ["low", "Low", "Keep best quality"],
                  ["medium", "Medium", "Good balance"],
                  ["high", "High", "Smaller file"],
                  ["extreme", "Extreme", "Smallest possible"],
                ].map(([val, label, sub]) => (
                  <button
                    key={val}
                    onClick={() => setCompressLevel(val)}
                    className={`py-3 px-2 rounded-lg text-center transition-colors ${compressLevel === val ? "bg-emerald-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                  >
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-[10px] mt-0.5 opacity-70">{sub}</span>
                  </button>
                ))}
              </div>
            </ParamSection>
          )}

          {tool.id === "to-image" && (
            <>
              <ParamSection label={`Pages${pageCount ? ` (1–${pageCount})` : ""}`}>
                <input type="text" placeholder='e.g. 1, 1-3, or "all"' value={imagePages} onChange={e => setImagePages(e.target.value)} className="input-field" />
                <p className="text-xs text-gray-600 mt-1.5">Type "all" for every page. Multiple pages → ZIP download.</p>
              </ParamSection>
              <ParamSection label="Quality">
                <select value={imageDPI} onChange={e => setImageDPI(e.target.value)} className="input-field">
                  <option value="72">72 DPI — Fast</option>
                  <option value="150">150 DPI — Standard</option>
                  <option value="200">200 DPI — High</option>
                  <option value="300">300 DPI — Print</option>
                </select>
              </ParamSection>
            </>
          )}

          {(tool.id === "protect" || tool.id === "unlock") && (
            <ParamSection label="Password">
              <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
            </ParamSection>
          )}

          {tool.id === "rotate" && (
            <ParamSection label="Rotation">
              <div className="flex gap-2">
                {[["90", "90° →"], ["180", "180° ↓"], ["270", "270° ←"]].map(([val, label]) => (
                  <button key={val} onClick={() => setDegrees(val)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${degrees === val ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                  >{label}</button>
                ))}
              </div>
            </ParamSection>
          )}

          {tool.id === "watermark" && (
            <>
              <ParamSection label="Watermark Text">
                <input type="text" placeholder="e.g. CONFIDENTIAL" value={wmText} onChange={e => setWmText(e.target.value)} className="input-field" />
              </ParamSection>
              <ParamSection label="Position">
                <div className="grid grid-cols-3 gap-2">
                  {[["top-left","↖ Top Left"],["top-right","↗ Top Right"],["center","⊙ Center"],["diagonal","⤡ Diagonal"],["bottom-left","↙ Bottom Left"],["bottom-right","↘ Bottom Right"]].map(([val, label]) => (
                    <button key={val} onClick={() => setWmPosition(val)}
                      className={`py-2 rounded-lg text-xs font-medium transition-colors ${wmPosition === val ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                    >{label}</button>
                  ))}
                </div>
              </ParamSection>
              <ParamSection label="Style">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Font Size</label>
                    <select value={wmFontsize} onChange={e => setWmFontsize(e.target.value)} className="input-field">
                      <option value="20">Small</option><option value="40">Medium</option><option value="60">Large</option><option value="80">XL</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Color</label>
                    <select value={wmColor} onChange={e => setWmColor(e.target.value)} className="input-field">
                      <option value="gray">Gray</option><option value="red">Red</option><option value="blue">Blue</option><option value="black">Black</option>
                    </select>
                  </div>
                </div>
              </ParamSection>
              <div className="mb-5 p-6 bg-white/[0.03] rounded-xl border border-white/[0.06]" style={{ minHeight: 100 }}>
                <p className="text-[10px] text-gray-600 mb-2">Preview</p>
                <div className="flex items-center justify-center h-14">
                  <span style={{ fontSize: `${Math.min(parseInt(wmFontsize) * 0.5, 32)}px` }}
                    className={`font-bold ${wmColor === "red" ? "text-red-400/40" : wmColor === "blue" ? "text-blue-400/40" : wmColor === "black" ? "text-gray-300/40" : "text-gray-400/30"} ${wmPosition === "diagonal" ? "-rotate-45" : ""}`}
                  >{wmText || "WATERMARK"}</span>
                </div>
              </div>
            </>
          )}

          {tool.id === "page-numbers" && (
            <>
              <ParamSection label="Position">
                <div className="grid grid-cols-2 gap-2">
                  {[["bottom-center","Bottom Center"],["bottom-right","Bottom Right"],["bottom-left","Bottom Left"],["top-center","Top Center"]].map(([val, label]) => (
                    <button key={val} onClick={() => setPnPosition(val)}
                      className={`py-2.5 rounded-lg text-xs font-medium transition-colors ${pnPosition === val ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                    >{label}</button>
                  ))}
                </div>
              </ParamSection>
              <ParamSection label="Start Number">
                <input type="number" placeholder="1" value={pnStart} onChange={e => setPnStart(e.target.value)} className="input-field" />
              </ParamSection>
            </>
          )}

          {tool.id === "crop" && (
            <ParamSection label="Margins to Trim (in points, 72pt = 1 inch)">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Top</label><input type="number" value={cropTop} onChange={e => setCropTop(e.target.value)} className="input-field" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Bottom</label><input type="number" value={cropBottom} onChange={e => setCropBottom(e.target.value)} className="input-field" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Left</label><input type="number" value={cropLeft} onChange={e => setCropLeft(e.target.value)} className="input-field" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Right</label><input type="number" value={cropRight} onChange={e => setCropRight(e.target.value)} className="input-field" /></div>
              </div>
            </ParamSection>
          )}

          {tool.id === "redact" && (
            <ParamSection label="Text to Redact">
              <input type="text" placeholder="Enter text to permanently black out" value={redactText} onChange={e => setRedactText(e.target.value)} className="input-field" />
              <p className="text-xs text-gray-600 mt-1.5">All occurrences of this text will be permanently removed and blacked out.</p>
            </ParamSection>
          )}

          {tool.id === "organize" && (
            <ParamSection label={`Page Order${pageCount ? ` (${pageCount} pages)` : ""}`}>
              <input type="text" placeholder="e.g. 3,1,2,5,4" value={pageOrder} onChange={e => setPageOrder(e.target.value)} className="input-field" />
              <p className="text-xs text-gray-600 mt-1.5">Reorder or omit pages. Comma-separated page numbers.</p>
            </ParamSection>
          )}

          {/* Execute */}
          <button
            onClick={executeTool}
            disabled={loading || files.length === 0}
            className={`w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${tool.color} hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg`}
          >
            {loading ? <Loader className="animate-spin w-5 h-5" /> : <Download className="w-5 h-5" />}
            {loading ? "Processing..." : `${tool.name} & Download`}
          </button>
        </div>
      </div>

      <style>{`
        .input-field {
          width: 100%; background: #0a0a0f; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.5rem; padding: 0.7rem 1rem; color: white; font-size: 0.875rem;
          outline: none; transition: border-color 0.2s;
        }
        .input-field:focus { border-color: #8b5cf6; }
        .input-field option { background: #0a0a0f; color: white; }
      `}</style>
    </div>
  );
}

function ParamSection({ label, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {children}
    </div>
  );
}
