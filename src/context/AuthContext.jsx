import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { STORAGE_KEYS } from "../constants/config";
import { setAuditActor } from "../utils/audit";
import { loadJSON, saveJSON } from "../utils/storage";
import { useData } from "./DataContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { employees, managers, settings } = useData();

  const [user, setUser] = useState(() => {
    const saved = loadJSON(STORAGE_KEYS.session, sessionStorage);
    if (saved?.role === "admin") return saved;
    if (saved?.role === "manager" && managers.some((x) => x.id === saved.id && x.status !== "Inactive")) return saved;
    if (saved?.role === "employee" && employees.some((x) => x.id === saved.id && x.status !== "Inactive" && !x.archived)) return saved;
    return null;
  });

  // Every change in the data layer is logged against the signed-in user.
  setAuditActor(user);

  // role: "employee" | "manager" | "admin". Returns an error message, or null on success.
  const login = useCallback(
    (role, username, password) => {
      const name = username.trim();
      const matches = (u) => String(u.username || "").toLowerCase() === name.toLowerCase() && u.password === password;
      let session;

      if (role === "admin") {
        const a = settings.admin;
        if (name.toLowerCase() !== String(a.username).toLowerCase() || password !== a.password) return "Invalid username or password.";
        session = { role: "admin", name: a.name || "Administrator" };
      } else if (role === "manager") {
        const m = managers.find(matches);
        if (!m) return "Invalid username or password.";
        if (m.status === "Inactive") return "This account is inactive. Please contact the administrator.";
        session = { role: "manager", name: m.name, id: m.id };
      } else {
        const emp = employees.find(matches);
        if (!emp) return "Invalid username or password.";
        if (emp.archived) return "This account is archived. Please contact the administrator.";
        if (emp.status === "Inactive") return "This account is inactive. Please contact the administrator.";
        session = { role: "employee", name: emp.name, id: emp.id };
      }

      saveJSON(STORAGE_KEYS.session, session, sessionStorage);
      setUser(session);
      return null;
    },
    [employees, managers, settings]
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
