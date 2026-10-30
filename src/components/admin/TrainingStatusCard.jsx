import { useMemo, useState } from "react";
import { EMPLOYEE_FILTERS } from "../../constants/config";
import { useData } from "../../context/DataContext";
import { downloadEmployeeRecordPDF, downloadTrainingReportPDF } from "../../utils/pdfReport";
import { assessmentLabel, filterEmployees, progressOf } from "../../utils/training";
import Pill from "../common/Pill";
import TypePill from "../common/TypePill";
import EmployeeForm from "./EmployeeForm";
import TrainingPanel from "./TrainingPanel";
import { TRAINING_TYPES } from "../../constants/training";
import { formatDate, today } from "../../utils/dates";
import { categoryLabel, refresherInfo, retentionInfo } from "../../utils/trainingRecords";

// canDelete / canEditProfile are enabled only in the Admin panel.
export default function TrainingStatusCard({ canDelete = false, canEditProfile = false }) {
  const { employees, trainers, toggleEmployeeStatus, archiveEmployee, restoreEmployee, deleteEmployee } = useData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [typeTab, setTypeTab] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [archiveFor, setArchiveFor] = useState(null); // { id, leavingDate, reason }
  const liveCount = (type) => employees.filter((e) => !e.archived && (type === "all" || (e.type === "Contractual" ? "Contractual" : "Regular") === type)).length;

  const list = useMemo(() => filterEmployees(employees, search, filter, typeTab), [employees, search, filter, typeTab]);
  const editing = employees.find((e) => e.id === editingId);
  const profile = employees.find((e) => e.id === profileId);

  const handleExport = () => {
    const label = EMPLOYEE_FILTERS.find((f) => f.value === filter)?.label;
    const parts = [typeTab === "all" ? "All employee types" : `${typeTab} employees`, label, search.trim() && `Search: "${search.trim()}"`];
    downloadTrainingReportPDF(list, { subtitle: parts.filter(Boolean).join(" | ") });
  };

  const handleDelete = (e) => {
    if (!window.confirm(`Permanently delete ${e.name} (${e.id})? This cannot be undone.`)) return;
    const err = deleteEmployee(e.id);
    if (err) { alert(err); return; }
    if (editingId === e.id) setEditingId(null);
  };

  const confirmArchive = () => {
    if (!archiveFor.leavingDate) { alert("Enter the date the employee left service (or today's date)."); return; }
    archiveEmployee(archiveFor.id, { leavingDate: archiveFor.leavingDate, reason: archiveFor.reason.trim() });
    if (editingId === archiveFor.id) setEditingId(null);
    setArchiveFor(null);
  };

  return (
    <div className="card mt-20">
      <div className="section-title">
        <div>
          <h3>Employee Training Status</h3>
          <div className="muted">
            Track training progress, assessment, practical/OJT and certificate status. Use <strong>Training</strong> to update records or add a new training.
          </div>
        </div>
        <div className="row-gap wrap">
          <button className="btn secondary" onClick={handleExport}>⬇ Download PDF Report</button>
        </div>
      </div>

      <div className="segmented mb-16">
        {[["all", "All"], ["Regular", "Regular"], ["Contractual", "Contractual"]].map(([value, label]) => (
          <button key={value} className={typeTab === value ? "active" : ""} onClick={() => setTypeTab(value)}>
            {label} ({liveCount(value)})
          </button>
        ))}
      </div>

      <div className="row-gap wrap mb-16">
        <input
          className="toolbar-input grow"
          placeholder="Search employee / ID / department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="toolbar-input" value={filter} onChange={(e) => setFilter(e.target.value)}>
          {EMPLOYEE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Type</th>
              <th>Training</th>
              <th>Training Progress</th>
              <th>Assessment</th>
              <th>Practical</th>
              <th>OJT</th>
              <th>Certificate</th>
              <th>Refresher</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={11} className="empty-row">No employees found.</td></tr>
            )}
            {list.map((e) => {
              const p = progressOf(e);
              return (
                <tr key={e.id}>
                  <td>
                    <strong>{e.name}</strong>
                    {e.archived ? <> <span className="pill bad">Archived</span></> : e.status === "Inactive" && <> <span className="pill bad">Inactive</span></>}
                    <div className="admin-row-meta">
                      {e.designation || ""}{e.department ? ` • ${e.department}` : ""}
                    </div>
                    <div className="admin-row-meta">{e.grade || "Worker"} • {categoryLabel(e)}{e.highlySkilled ? " • Highly skilled" : ""}</div>
                    {e.archived && <div className="admin-row-meta">Left {formatDate(e.archived.leavingDate)} • {retentionInfo(e).label}</div>}
                  </td>
                  <td>{e.id}</td>
                  <td>
                    <TypePill employee={e} />
                    {e.contractor && <div className="admin-row-meta">{e.contractor}</div>}
                  </td>
                  <td>
                    <strong>{TRAINING_TYPES.find((t) => t.key === e.trainingType)?.short || "—"}</strong>
                    <div className="admin-row-meta">{e.course} • {e.daysCompleted ?? "—"}/{e.requiredDays ?? "—"} days</div>
                  </td>
                  <td className="progress-cell">
                    {p}%
                    <div className="progress" style={{ margin: "4px 0 0" }}><span style={{ width: `${p}%` }} /></div>
                  </td>
                  <td><Pill text={assessmentLabel(e)} /></td>
                  <td><Pill text={e.practical || "Pending"} /></td>
                  <td><Pill text={e.ojt || "Pending"} /></td>
                  <td>
                    <Pill text={e.certificate || "Pending"} />
                    {e.certNo && <div className="admin-row-meta">{e.certNo}</div>}
                  </td>
                  <td>
                    {(() => {
                      const r = refresherInfo(e);
                      return r.status === "none" ? <span className="muted">—</span> : (
                        <>
                          <Pill text={r.status === "ok" ? "Up to date" : r.label} />
                          <div className="admin-row-meta">Due {formatDate(r.due)}</div>
                        </>
                      );
                    })()}
                    {e.evalStatus && ["Additional training required", "Re-evaluation due"].includes(e.evalStatus) && <div><Pill text={e.evalStatus} /></div>}
                  </td>
                  <td>
                    <div className="employee-actions">
                      <button className="btn" onClick={() => setEditingId(e.id)}>Training</button>
                      {!e.archived && (
                        <button className="btn secondary" onClick={() => toggleEmployeeStatus(e.id)}>
                          {e.status === "Inactive" ? "Activate" : "Deactivate"}
                        </button>
                      )}
                      {canEditProfile && !e.archived && <button className="btn secondary" onClick={() => setProfileId(e.id)}>Edit Profile</button>}
                      <button className="btn secondary" onClick={() => downloadEmployeeRecordPDF(e, trainers)}>📄 Record</button>
                      {e.archived
                        ? <button className="btn secondary" onClick={() => restoreEmployee(e.id)}>Restore</button>
                        : <button className="btn secondary" onClick={() => setArchiveFor({ id: e.id, leavingDate: today(), reason: "" })}>Archive</button>}
                      {canDelete && <button className="btn danger" onClick={() => handleDelete(e)}>Delete</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {archiveFor && (
        <div className="panel open">
          <h3>Archive {employees.find((x) => x.id === archiveFor.id)?.name}</h3>
          <div className="muted">The employee is removed from the working lists and can no longer log in. Training records are kept for the whole service and 5 years after the leaving date.</div>
          <div className="grid cols-3 mt-12">
            <div><label className="muted" htmlFor="ar-date">Date left service</label><input id="ar-date" type="date" className="admin-input" value={archiveFor.leavingDate} onChange={(e) => setArchiveFor((a) => ({ ...a, leavingDate: e.target.value }))} /></div>
            <div><label className="muted" htmlFor="ar-reason">Reason</label><input id="ar-reason" className="admin-input" placeholder="Retired / resigned / transferred…" value={archiveFor.reason} onChange={(e) => setArchiveFor((a) => ({ ...a, reason: e.target.value }))} /></div>
          </div>
          <div className="row-gap mt-12">
            <button className="btn" onClick={confirmArchive}>Archive employee</button>
            <button className="btn secondary" onClick={() => setArchiveFor(null)}>Cancel</button>
          </div>
        </div>
      )}

      {profile && <EmployeeForm key={profile.id} employee={profile} onClose={() => setProfileId(null)} />}

      {editing && (
        <TrainingPanel key={editing.id} employee={editing} canDelete={canDelete} onClose={() => setEditingId(null)} />
      )}
    </div>
  );
}
