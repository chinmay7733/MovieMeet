import { createContext } from "react";

export const AuthContext = createContext({
  token: null,
  role: "client",
  isAdmin: false,
  isAuthenticated: false,
  setToken: () => {},
  logout: () => {},
});
