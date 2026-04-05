import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const { handleAuthCallback } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const authError = params.get("error");

    if (authError) {
      setError("Google sign-in was cancelled.");
      return;
    }

    if (code) {
      handleAuthCallback(code).then((success) => {
        if (success) {
          window.location.href = "/";
        } else {
          setError("Authentication failed. Please try again.");
        }
      });
    } else {
      setError("No authorization code received.");
    }
  }, [handleAuthCallback]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <a
            href="/"
            className="text-violet-400 hover:text-violet-300 underline"
          >
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Signing you in...</p>
      </div>
    </div>
  );
}
