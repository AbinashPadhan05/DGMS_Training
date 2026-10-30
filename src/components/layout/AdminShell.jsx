import { useState } from "react";
import AuditPage from "../../pages/admin/AuditPage";
import TrainersPage from "../../pages/admin/TrainersPage";
import CircularsPage from "../../pages/admin/CircularsPage";
import EmployeesPage from "../../pages/admin/EmployeesPage";
import ManagersPage from "../../pages/admin/ManagersPage";
import OverviewPage from "../../pages/admin/OverviewPage";
import QuestionsPage from "../../pages/admin/QuestionsPage";
import ReportsPage from "../../pages/admin/ReportsPage";
import SettingsPage from "../../pages/admin/SettingsPage";
import Sidebar, { ADMIN_NAV } from "./Sidebar";
import Topbar from "./Topbar";

// Administrator panel, served only at /admin.
export default function AdminShell() {
  const [page, setPage] = useState("overview");
  return (
    <>
      <Topbar />
      <div className="layout">
        <Sidebar title="Administration" items={ADMIN_NAV} page={page} onNavigate={setPage} />
        <main>
          {page === "overview" && <OverviewPage onNavigate={setPage} />}
          {page === "employees" && <EmployeesPage />}
          {page === "managers" && <ManagersPage />}
          {page === "trainers" && <TrainersPage />}
          {page === "circulars" && <CircularsPage />}
          {page === "questions" && <QuestionsPage />}
          {page === "reports" && <ReportsPage />}
          {page === "audit" && <AuditPage />}
          {page === "settings" && <SettingsPage />}
        </main>
      </div>
    </>
  );
}
