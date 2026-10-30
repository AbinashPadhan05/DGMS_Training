import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Dashboard from "../../pages/employee/Dashboard";
import Exam from "../../pages/employee/Exam";
import Certificate from "../../pages/employee/Certificate";
import AttendancePage from "../../pages/common/AttendancePage";
import SyllabusPage from "../../pages/common/SyllabusPage";
import ManagerPage from "../../pages/manager/ManagerPage";
import Sidebar, { EMPLOYEE_NAV, MANAGER_NAV } from "./Sidebar";
import Topbar from "./Topbar";

// Shell for the Employee and Manager roles. The Admin panel lives in AdminShell (/admin).
export default function AppShell() {
  const { user } = useAuth();
  const isManager = user.role === "manager";
  const nav = isManager ? MANAGER_NAV : EMPLOYEE_NAV;
  const [page, setPage] = useState(nav[0].page);

  // Never render a page the role has no menu entry for.
  const current = nav.some((n) => n.page === page) ? page : nav[0].page;

  return (
    <>
      <Topbar />
      <div className="layout">
        <Sidebar items={nav} page={current} onNavigate={setPage} />
        <main>
          {current === "dashboard" && <Dashboard />}
          {current === "exam" && <Exam onNavigate={setPage} />}
          {current === "certificate" && <Certificate />}
          {current === "syllabus" && <SyllabusPage />}
          {current === "manager" && <ManagerPage />}
          {current === "attendance" && <AttendancePage />}
        </main>
      </div>
    </>
  );
}
