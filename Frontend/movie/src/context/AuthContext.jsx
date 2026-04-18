import { useEffect, useState } from "react";
import { AuthContext } from "./auth-context";

const getRoleFromToken = (token) => {
  if (!token) {
    return "client";
  }

  try {
    const [, payload] = token.split(".");
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(normalizedPayload));

    return decodedPayload?.role === "admin" ? "admin" : "client";
  } catch {
    return "client";
  }
};

const persistAuthState = (authState) => {
  if (authState.token) {
    localStorage.setItem("token", authState.token);
    localStorage.setItem("role", authState.role || "client");
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("role");
};

export function AuthProvider({ children }) {
  const initialToken = localStorage.getItem("token");
  const [authState, setAuthState] = useState(() => ({
    token: initialToken,
    role: getRoleFromToken(initialToken),
  }));

  useEffect(() => {
    persistAuthState(authState);
  }, [authState]);

  const setToken = (value) => {
    setAuthState((currentState) => {
      let nextState;

      if (!value) {
        nextState = { token: null, role: "client" };
        persistAuthState(nextState);
        return nextState;
      }

      if (typeof value === "string") {
        nextState = { token: value, role: getRoleFromToken(value) || currentState.role || "client" };
        persistAuthState(nextState);
        return nextState;
      }

      nextState = {
        token: value.token ?? null,
        role: value.token ? getRoleFromToken(value.token) : value.role ?? "client",
      };

      persistAuthState(nextState);
      return nextState;
    });
  };

  const value = {
    token: authState.token,
    role: authState.role,
    isAdmin: authState.role === "admin",
    isAuthenticated: Boolean(authState.token),
    setToken,
    logout: () => setToken(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
