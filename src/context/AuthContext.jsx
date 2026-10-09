import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEMO_ADMIN, STORAGE_KEYS } from "../constants/config";
import { loadJSON, saveJSON } from "../utils/storage";
import { useData } from "./DataContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { employees } = useData();

  const [user, setUser] = useState(() => {
    const saved = loadJSON(STORAGE_KEYS.session, sessionStorage);
    if (saved?.role === "admin") return saved;
    if (saved?.role === "employee" && employees.some((x) => x.id === saved.id && x.status !== "Inactive")) return saved;
    return null;
  });

  // Returns an error message, or null on success.
  const login = useCallback(
    (role, username, password) => {
      const name = username.trim();
      let session;

      if (role === "admin") {
        if (name !== DEMO_ADMIN.username || password !== DEMO_ADMIN.password) return "Invalid username or password.";
        session = { role: "admin", name: DEMO_ADMIN.name };
      } else {
        const emp = employees.find(
          (x) => String(x.username || "").toLowerCase() === name.toLowerCase() && x.password === password
        );
        if (!emp) return "Invalid username or password.";
        if (emp.status === "Inactive") return "This account is inactive. Please contact the administrator.";
        session = { role: "employee", name: emp.name, id: emp.id };
      }

      saveJSON(STORAGE_KEYS.session, session, sessionStorage);
      setUser(session);
      return null;
    },
    [employees]
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEYS.session);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
