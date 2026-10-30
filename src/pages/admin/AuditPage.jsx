import { useMemo, useState } from "react";
import InspectionCard from "../../components/admin/InspectionCard";
import StatCard from "../../components/common/StatCard";
import { useData } from "../../context/DataContext";
import { downloadAuditLogPDF } from "../../utils/pdfReport";

const stamp = (iso) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export default function AuditPage() {
  const { employees, auditLog } = useData();
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const records = employees.flatMap((e) => e.trainings.map((t) => ({ e, t })));
    return {
      records: records.length,
      noAttendance: records.filter(({ t }) => !(t.attendance || []).length).length,
      noLog: records.filter(({ t }) => !(t.sessions || []).length).length,
      certNoDoc: records.filter(({ t }) => t.certificate === "Issued" && !(t.documents || []).length).length,
      noCategory: employees.filter((e) => !e.archived && !e.category).length,
      archived: employees.filter((e) => e.archived).length,
    };
  }, [employees]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditLog.filter((a) => !q || `${a.by} ${a.action} ${a.target} ${a.detail}`.toLowerCase().includes(q));
  }, [auditLog, search]);

  return (
    <section>
      <div className="section-title">
        <div>
          <h2>Audit & Compliance</h2>
          <div className="muted">Completeness of training records and a log of every change, for periodic audit and inspection.</div>
        </div>
      </div>

      <div className="grid four mt-0">
        <StatCard value={stats.records} label="Training Records" />
        <StatCard value={stats.noAttendance} label="Without Attendance Register" />
        <StatCard value={stats.noLog} label="Without Training Log" />
        <StatCard value={stats.certNoDoc} label="Certificates Without Document Scan" />
      </div>
      <div className="grid four">
        <StatCard value={stats.noCategory} label="Employees Without Mine Category" />
        <StatCard value={stats.archived} label="Archived (Retained) Employees" />
      </div>

      <InspectionCard />

      <div className="card mt-20">
        <div className="section-title">
          <div>
            <h3>Audit log</h3>
            <div className="muted">Latest first. Up to 1000 entries are kept. The log is not cleared by "Reset All Data".</div>
          </div>
          <button className="btn secondary" onClick={() => downloadAuditLogPDF(rows, { subtitle: search.trim() ? `Search: "${search.trim()}"` : "" })}>⬇ Download PDF</button>
        </div>
        <input className="toolbar-input full mb-16" placeholder="Search user, action, employee…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="table-wrap scroll-box tall">
          <table>
            <thead><tr><th>Date / time</th><th>User</th><th>Action</th><th>Record</th><th>Details</th></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={5} className="empty-row">No entries{search ? " match the search" : " yet. Changes made from now on are logged here"}.</td></tr>}
              {rows.slice(0, 300).map((a) => (
                <tr key={a.id}>
                  <td>{stamp(a.at)}</td>
                  <td>{a.by}<div className="admin-row-meta">{a.role}</div></td>
                  <td><strong>{a.action}</strong></td>
                  <td>{a.target || "—"}</td>
                  <td className="wrap-cell">{a.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 300 && <div className="muted mt-12">Showing the latest 300 of {rows.length}. The PDF contains all matching entries.</div>}
      </div>
    </section>
  );
}
