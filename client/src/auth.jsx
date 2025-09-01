// src/auth.jsx
import { createContext, useContext, useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_AUTH_API || "http://127.0.0.1:8001";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (token) {
        try {
          const r = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (r.ok) setUser(await r.json());
          else {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          }
        } catch {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    })();
  }, [token]);

  async function signup({ email, password }) {
    const r = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) {
      let msg = "Signup failed";
      try { const j = await r.json(); if (j?.detail) msg = j.detail; } catch {}
      throw new Error(msg);
    }
    // do NOT log in automatically; user must log in separately
    return true;
  }

  async function login({ email, password }) {
    const r = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) {
      let msg = "Invalid credentials";
      try { const j = await r.json(); if (j?.detail) msg = j.detail; } catch {}
      throw new Error(msg);
    }
    const data = await r.json();
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);

    const me = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    if (me.ok) setUser(await me.json());
    return true;
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
