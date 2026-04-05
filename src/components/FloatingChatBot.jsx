import { useState, useRef, useEffect } from "react";
import api from "../api";
import { Send, X, MessageSquare, Loader, Bot, User } from "lucide-react";

export default function FloatingChatbot({ jobId }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI assistant for this document. Ask me anything about the content.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleAsk = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.get("/ask", {
        params: { job_id: jobId, question: q },
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                     bg-gradient-to-br from-violet-600 to-blue-600
                     text-white shadow-2xl shadow-violet-600/30
                     flex items-center justify-center
                     hover:scale-110 hover:shadow-violet-600/50
                     active:scale-95 transition-all duration-300"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-48px)]
                      flex flex-col
                      bg-[#12121a]/95 backdrop-blur-xl
                      border border-white/10 rounded-2xl
                      shadow-2xl shadow-black/50
                      animate-slideup overflow-hidden"
          style={{ height: "min(600px, calc(100vh - 100px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  ProtonPDF AI
                </h3>
                <p className="text-gray-500 text-xs">
                  Ask about your document
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                    msg.role === "user"
                      ? "bg-violet-600/20"
                      : "bg-blue-600/20"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5 text-violet-400" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-violet-600/20 text-violet-100 rounded-tr-sm"
                      : "bg-white/[0.06] text-gray-300 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-blue-600/20">
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.06]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/10">
            <div className="flex items-center gap-2 bg-white/[0.06] rounded-xl px-3 py-2 border border-white/10 focus-within:border-violet-500/50 transition-colors">
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                disabled={loading}
              />
              <button
                onClick={handleAsk}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600
                           flex items-center justify-center text-white
                           disabled:opacity-30 hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
