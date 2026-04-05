import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api";

const AuthContext = createContext(null);

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem("protonpdf_token");
    const savedUser = localStorage.getItem("protonpdf_user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("protonpdf_token");
        localStorage.removeItem("protonpdf_user");
      }
    }
    setLoading(false);
  }, []);

  const handleGoogleLogin = useCallback(() => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = "openid email profile";
    const url =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&access_type=offline` +
      `&prompt=consent`;
    window.location.href = url;
  }, []);

  const handleAuthCallback = useCallback(async (code) => {
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const res = await api.post("/auth/google", {
        code,
        redirect_uri: redirectUri,
      });
      const { token, user: userData } = res.data;
      localStorage.setItem("protonpdf_token", token);
      localStorage.setItem("protonpdf_user", JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (err) {
      console.error("Auth failed:", err);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("protonpdf_token");
    localStorage.removeItem("protonpdf_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, handleGoogleLogin, handleAuthCallback, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
