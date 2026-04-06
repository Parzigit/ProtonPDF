import { useState, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react"
import LandingPage from "./components/LandingPage";
import AuthCallback from "./components/AuthCallback";
import UploadPDF from "./components/UploadPDF";
import PDFViewer from "./components/PDFViewer";
import AISidePanel from "./components/AISidePanel";
import ToolsDashboard from "./components/ToolsDashboard";
import { API_BASE } from "./api";
import "./App.css";

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [showTools, setShowTools] = useState(() => !sessionStorage.getItem("protonpdf_jobId"));
  const [panelWidth, setPanelWidth] = useState(400);
  const [targetPage, setTargetPage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const appContainerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Persist jobId in sessionStorage so it survives page reload
  const [jobId, setJobId] = useState(() => {
    return sessionStorage.getItem("protonpdf_jobId") || null;
  });

  useEffect(() => {
    if (jobId) {
      sessionStorage.setItem("protonpdf_jobId", jobId);
    } else {
      sessionStorage.removeItem("protonpdf_jobId");
    }
  }, [jobId]);

  // Handle OAuth callback route
  if (window.location.pathname === "/auth/callback") {
    return <AuthCallback />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated → landing page
  if (!user) {
    return <LandingPage />;
  }

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      appContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const fileUrl = jobId ? `${API_BASE}/pdf/${jobId}` : null;

  const handleGoToPage = (page) => {
    setTargetPage(page);
    setTimeout(() => setTargetPage(null), 100);
  };

  // Authenticated → main app
  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0f] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 bg-[#12121a] border-b border-white/[0.06] flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            P
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            ProtonPDF
          </span>
          {jobId && !showTools && (
            <button
              onClick={() => setJobId(null)}
              className="ml-4 text-xs text-gray-500 hover:text-gray-300 bg-white/5 px-3 py-1 rounded-lg transition-colors"
            >
              ← New Upload
            </button>
          )}
          <button
            onClick={() => setShowTools(prev => !prev)}
            className={`ml-4 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center ${showTools ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            {showTools ? "Exit Toolkit" : "🛠️ Toolkit"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {user.picture && (
              <img
                src={user.picture}
                alt=""
                className="w-7 h-7 rounded-full ring-2 ring-white/10"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="text-gray-400 text-sm hidden sm:inline">
              {user.name}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      {showTools ? (
        <ToolsDashboard onBack={() => setShowTools(false)} onOpenReader={() => setShowTools(false)} />
      ) : !jobId ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <h2 className="text-3xl font-bold text-white mb-2">Upload a PDF</h2>
          <p className="text-gray-500 mb-10 text-sm">
            Choose a document to analyze with AI
          </p>
          <UploadPDF setJobId={setJobId} />
        </div>
      ) : (
        <div ref={appContainerRef} className="flex-1 w-full flex flex-col relative overflow-hidden bg-[#525659]">
          {/* Responsive wrapping handles squashing the PDF seamlessly beside the AI Box, disabling itself smartly on Mobile */}
          <div 
            className={`flex-1 min-h-0 flex flex-col transition-all duration-300 origin-left ease-out`}
            style={{ marginRight: (sidePanelOpen && !isMobile) ? `${panelWidth}px` : "0px" }}
          >
            <PDFViewer 
              fileUrl={fileUrl} 
              goToPage={targetPage} 
              onToggleFullscreen={handleToggleFullscreen} 
            />
          </div>
          {/* AI Panel — placed inside the fullscreen container so it stays visible */}
          <AISidePanel
            jobId={jobId}
            isOpen={sidePanelOpen}
            onToggle={() => setSidePanelOpen(!sidePanelOpen)}
            onGoToPage={handleGoToPage}
            panelWidth={panelWidth}
            setPanelWidth={setPanelWidth}
            isMobile={isMobile}
          />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
}
