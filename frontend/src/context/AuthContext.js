"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const savedAccessToken = localStorage.getItem("access");
    const savedRefreshToken = localStorage.getItem("refresh");

    if (savedAccessToken) {
      setIsAuthenticated(true);
      setAccessToken(savedAccessToken);
      setRefreshToken(savedRefreshToken || "");
    }

    setAuthLoading(false);
  }, []);

  function login(tokens) {
    localStorage.setItem("access", tokens.access);
    localStorage.setItem("refresh", tokens.refresh);
    setAccessToken(tokens.access);
    setRefreshToken(tokens.refresh);
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAccessToken("");
    setRefreshToken("");
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        accessToken,
        refreshToken,
        authLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
