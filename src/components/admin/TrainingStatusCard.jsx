import { useMemo, useState } from "react";
import { EMPLOYEE_FILTERS } from "../../constants/config";
import { useData } from "../../context/DataContext";
import { downloadTrainingReportPDF } from "../../utils/pdfReport";
import { assessmentLabel, filterEmployees, progressOf } from "../../utils/training";
import Pill from "../common/Pill";
import TypePill from "../common/TypePill";
import EmployeeForm from "./EmployeeForm";
import RecordEditor from "./RecordEditor";

// canDelete / canEditProfile are enabled only in the Admin panel.
export default function TrainingStatusCard({ canDelete = false, canEditProfile = false }) {
  const { employees, updateEmployee, toggleEmployeeStatus, deleteEmployee } = useData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [typeTab, setTypeTab] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [profileId, setProfileId] = useState(null);

  const list = useMemo(() => filterEmployees(employees, search, filter, typeTab), [employees, search, filter, typeTab]);
  const editing = employees.find((e) => e.id === editingId);
  const profile = employees.find((e) => e.id === profileId);

  const handleExport = () => {
    const label = EMPLOYEE_FILTERS.find((f) => f.value === filter)?.label;
    const parts = [typeTab === "all" ? "All employee types" : `${typeTab} employees`, label, search.trim() && `Search: "${search.trim()}"`];
    downloadTrainingReportPDF(list, { subtitle: parts.filter(Boolean).join(" | ") });
  };

  const handleDelete = (e) => {
    if (!window.confirm(`Delete employee ${e.name} (${e.id})?`)) return;
    deleteEmployee(e.id);
    if (editingId === e.id) setEditingId(null);
  };

  const handleSave = (id, patch) => {
    updateEmployee(id, patch);
    setEditingId(null);
  };

  return (
    <div className="card mt-20">
      <div className="section-title">
        <div>
          <h3>Employee Training Status</h3>
          <div className="muted">
            Track training progress, assessment, practical/OJT and certificate status. Use <strong>Update</strong> to change a record.
          </div>
        </div>
        <div className="row-gap wrap">
          <button className="btn secondary" onClick={handleExport}>⬇ Download PDF Report</button>
        </div>
      </div>

      <div className="segmented mb-16">
        {[["all", "All"], ["Regular", "Regular"], ["Contractual", "Contractual"]].map(([value, label]) => (
          <button key={value} className={typeTab === value ? "active" : ""} onClick={() => setTypeTab(value)}>
            {label} ({value === "all" ? employees.length : employees.filter((e) => (e.type === "Contractual" ? "Contractual" : "Regular") === value).length})
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
              <th>Training Programme</th>
              <th>Training Progress</th>
              <th>Assessment</th>
              <th>Practical</th>
              <th>OJT</th>
              <th>Certificate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={10} className="empty-row">No employees found.</td></tr>
            )}
            {list.map((e) => {
              const p = progressOf(e);
              return (
                <tr key={e.id}>
                  <td>
                    <strong>{e.name}</strong>
                    {e.status === "Inactive" && <> <span className="pill bad">Inactive</span></>}
                    <div className="admin-row-meta">
                      {e.designation || ""}{e.department ? ` • ${e.department}` : ""}
                    </div>
                  </td>
                  <td>{e.id}</td>
                  <td>
                    <TypePill employee={e} />
                    {e.contractor && <div className="admin-row-meta">{e.contractor}</div>}
                  </td>
                  <td>{e.course}</td>
                  <td className="progress-cell">
                    {p}%
                    <div className="progress" style={{ margin: "4px 0 0" }}><span style={{ width: `${p}%` }} /></div>
                  </td>
                  <td><Pill text={assessmentLabel(e)} /></td>
                  <td><Pill text={e.practical || "Pending"} /></td>
                  <td><Pill text={e.ojt || "Pending"} /></td>
                  <td><Pill text={e.certificate || "Pending"} /></td>
                  <td>
                    <div className="employee-actions">
                      <button className="btn" onClick={() => setEditingId(e.id)}>Update</button>
                      <button className="btn secondary" onClick={() => toggleEmployeeStatus(e.id)}>
                        {e.status === "Inactive" ? "Activate" : "Deactivate"}
                      </button>
                      {canEditProfile && <button className="btn secondary" onClick={() => setProfileId(e.id)}>Edit Profile</button>}
                      {canDelete && <button className="btn danger" onClick={() => handleDelete(e)}>Delete</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {profile && <EmployeeForm key={profile.id} employee={profile} onClose={() => setProfileId(null)} />}

      {editing && (
        <RecordEditor key={editing.id} employee={editing} onSave={handleSave} onClose={() => setEditingId(null)} />
      )}
    </div>
  );
}
