import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { handleGoogleLogin } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] animate-float-delayed" />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-indigo-600/15 rounded-full blur-[100px] animate-float-slow" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/25">
            P
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">
            ProtonPDF
          </span>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Powered by Llama 3.3 · 70B parameters
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-center leading-tight max-w-4xl">
          <span className="text-white">Your PDFs, </span>
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            supercharged
          </span>
          <span className="text-white"> with AI</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-400 text-center max-w-2xl leading-relaxed">
          Upload any PDF and chat with it instantly. ProtonPDF extracts,
          understands, and answers your questions — powered by state-of-the-art AI.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="mt-10 group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-base
                     shadow-2xl shadow-white/10 hover:shadow-white/20
                     transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
          <span className="absolute inset-0 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all" />
        </button>

        <p className="mt-4 text-xs text-gray-600">
          Free to use · No credit card required
        </p>

        {/* Feature cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {[
            {
              icon: "📄",
              title: "Upload & Parse",
              desc: "Drag & drop any PDF. We extract and index the content in seconds.",
            },
            {
              icon: "🤖",
              title: "AI-Powered Q&A",
              desc: "Ask questions in natural language. Get precise answers from your documents.",
            },
            {
              icon: "⚡",
              title: "Lightning Fast",
              desc: "Powered by Groq's inference engine — responses in under a second.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm
                         hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-600 text-sm">
        ProtonPDF © {new Date().getFullYear()} · Built with ❤️
      </footer>
    </div>
  );
}
