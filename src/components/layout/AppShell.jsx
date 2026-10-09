import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Dashboard from "../../pages/employee/Dashboard";
import Exam from "../../pages/employee/Exam";
import Certificate from "../../pages/employee/Certificate";
import AdminPage from "../../pages/admin/AdminPage";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  const [page, setPage] = useState(isAdmin ? "admin" : "dashboard");

  // Admins only ever see the admin page; employees can't open it.
  const current = isAdmin ? "admin" : page === "admin" ? "dashboard" : page;

  return (
    <>
      <Topbar />
      <div className="layout">
        <Sidebar role={user.role} page={current} onNavigate={setPage} />
        <main>
          {current === "dashboard" && <Dashboard />}
          {current === "exam" && <Exam onNavigate={setPage} />}
          {current === "certificate" && <Certificate />}
          {current === "admin" && <AdminPage />}
        </main>
      </div>
    </>
  );
}
