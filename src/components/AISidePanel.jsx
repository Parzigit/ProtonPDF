import { useState, useRef, useEffect } from "react";
import api from "../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  Send,
  Bot,
  User,
  Loader,
  Sparkles,
  Trash2,
  MessageSquare,
  X,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AISidePanel({ jobId, isOpen, onToggle, onGoToPage, panelWidth, setPanelWidth, isMobile }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I can help you understand this document. Ask me about key concepts, formulas, summaries, or anything else.",
      sources: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const startResizing = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    const startX = mouseDownEvent.clientX;
    const startWidth = panelWidth;

    const onMouseMove = (moveEvent) => {
      // The panel is on the right, so moving the mouse left (negative delta) means increasing the width
      const newWidth = Math.max(300, Math.min(800, startWidth + (startX - moveEvent.clientX)));
      setPanelWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleAsk = async () => {
    const q = input.trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: q, sources: [] }]);
    setInput("");
    setLoading(true);

    // Capture current messages (excluding the first greeting) as history
    const history = messages.slice(1).map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const res = await api.post("/ask", {
        job_id: jobId,
        question: q,
        history: history
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.answer,
          sources: res.data.sources || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          sources: [],
        },
      ]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. Feel free to ask me anything about this document.",
        sources: [],
      },
    ]);
    setExpandedSources({});
  };

  const quickPrompts = [
    "Summarize this document",
    "List all formulas used",
    "What are the key findings?",
    "Explain the methodology",
  ];

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const toggleSources = (msgIndex) => {
    setExpandedSources((prev) => ({ ...prev, [msgIndex]: !prev[msgIndex] }));
  };

  // ─── Collapsed state: floating button ───
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                   bg-gradient-to-br from-violet-600 to-blue-600
                   flex items-center justify-center text-white
                   shadow-lg shadow-violet-600/30
                   hover:shadow-violet-600/50 hover:scale-105
                   active:scale-95 transition-all duration-200"
        title="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  // ─── Open state: fixed right panel ───
  return (
    <div 
      className={`fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-[#1a1a2e] shadow-2xl shadow-black/50 ${isMobile ? "w-full" : "border-l border-white/[0.08]"}`}
      style={{ width: isMobile ? "100%" : `${panelWidth}px` }}
    >
      {/* Draggable resize handle */}
      {!isMobile && (
        <div 
          onMouseDown={startResizing}
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-violet-500/50 z-50 transition-colors"
        />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#12121f] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-md">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Proton AI</h3>
            <p className="text-gray-500 text-[10px]">Powered by Llama 3.3</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
          <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Suggestions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-2.5 py-1.5 text-[11px] text-gray-400 bg-white/[0.03]
                           border border-white/[0.06] rounded-md
                           hover:bg-violet-500/10 hover:text-violet-300 hover:border-violet-500/20
                           transition-all duration-200"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5 ${
                msg.role === "user" ? "bg-violet-600/20" : "bg-blue-600/20"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-3.5 h-3.5 text-violet-400" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-blue-400" />
              )}
            </div>
            <div className="flex flex-col gap-1.5 min-w-0 max-w-[85%]">
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-violet-600/15 text-violet-100 rounded-tr-sm border border-violet-500/10"
                    : "bg-white/[0.04] text-gray-300 rounded-tl-sm border border-white/[0.06]"
                }`}
              >
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <div className="prose prose-invert prose-sm max-w-full overflow-x-auto
                                  prose-p:my-1.5 prose-p:leading-relaxed 
                                  prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:overflow-x-auto
                                  prose-table:block prose-table:overflow-x-auto prose-table:w-full prose-table:border-collapse prose-table:my-2
                                  prose-th:border prose-th:border-white/10 prose-th:bg-white/5 prose-th:p-2 prose-th:text-left
                                  prose-td:border prose-td:border-white/10 prose-td:p-2
                                  prose-h3:text-sm prose-h3:font-semibold prose-h3:mt-3
                                  prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1
                                  prose-a:text-violet-400
                                  prose-code:text-violet-300 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded prose-code:break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Source References */}
              {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                <div className="ml-0.5">
                  <button
                    onClick={() => toggleSources(i)}
                    className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-violet-400 transition-colors py-1"
                  >
                    <FileText className="w-3 h-3" />
                    {msg.sources.length} source{msg.sources.length > 1 ? "s" : ""} referenced
                    {expandedSources[i] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  
                  {expandedSources[i] && (
                    <div className="mt-1 space-y-1.5">
                      {msg.sources.map((src, si) => (
                        <button
                          key={si}
                          onClick={() => onGoToPage?.(src.page)}
                          className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]
                                     hover:bg-violet-500/10 hover:border-violet-500/20 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-medium text-violet-400 bg-violet-500/15 px-1.5 py-0.5 rounded">
                              Page {src.page}
                            </span>
                            <span className="text-[10px] text-gray-600">
                              Click to navigate →
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 group-hover:text-gray-400">
                            {src.text}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-blue-600/20 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/[0.08] bg-[#12121f] flex-shrink-0">
        <div className="flex items-end gap-2 bg-white/[0.04] rounded-xl px-3 py-2 border border-white/[0.08] focus-within:border-violet-500/40 transition-colors">
          <textarea
            ref={inputRef}
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-500
                       outline-none resize-none min-h-[36px] max-h-[120px] leading-relaxed scrollbar-thin"
            placeholder="Ask about this document..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            disabled={loading}
            rows={1}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600
                       flex items-center justify-center text-white flex-shrink-0
                       disabled:opacity-30 hover:opacity-90 active:scale-95
                       transition-all duration-150"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-1.5 text-center">
          Shift+Enter for new line · Answers cite document pages
        </p>
      </div>
    </div>
  );
}
