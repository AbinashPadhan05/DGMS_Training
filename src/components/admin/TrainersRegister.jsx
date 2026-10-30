import { useState } from "react";
import { TRAINER_ROLES } from "../../constants/training";
import { useData } from "../../context/DataContext";
import { formatDate, today } from "../../utils/dates";
import { downloadTrainersPDF } from "../../utils/pdfReport";

const blank = () => ({ id: "", name: "", designation: "", role: TRAINER_ROLES[1], appointmentDate: today(), status: "Active" });

// Training officer, instructors and authorized trainers (circular section 5.0 (i)).
export default function TrainersRegister({ canDelete = false }) {
  const { trainers, employees, addTrainer, updateTrainer, deleteTrainer } = useData();
  const [form, setForm] = useState(null);
  const editing = !!form?.existing;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const sessionsOf = (id) => employees.reduce((n, e) => n + e.trainings.reduce((m, t) => m + (t.sessions || []).filter((s) => s.trainerId === id).length, 0), 0);

  const handleSave = () => {
    const name = form.name.trim();
    if (!name) { alert("Trainer name is required."); return; }
    const data = { name, designation: form.designation.trim(), role: form.role, appointmentDate: form.appointmentDate, status: form.status };
    if (editing) {
      updateTrainer(form.id, data);
    } else {
      const next = trainers.reduce((n, t) => Math.max(n, Number(String(t.id).replace(/\D/g, "")) || 0), 0) + 1;
      addTrainer({ id: `TR-${String(next).padStart(3, "0")}`, ...data });
    }
    setForm(null);
  };

  const handleDelete = (t) => {
    if (!window.confirm(`Delete trainer ${t.name}?`)) return;
    const err = deleteTrainer(t.id);
    if (err) alert(err);
  };

  return (
    <div className="card mt-20">
      <div className="section-title">
        <div>
          <h3>🧑‍🏫 Trainers & Instructors Register</h3>
          <div className="muted">Appointments of the training officer, instructors and authorized OJT trainers. They can be selected in each training log.</div>
        </div>
        <div className="row-gap wrap">
          <button className="btn" onClick={() => setForm(blank())}>+ Add Trainer</button>
          <button className="btn secondary" onClick={() => downloadTrainersPDF(trainers, employees)}>⬇ Download PDF</button>
        </div>
      </div>

      {form && (
        <div className="panel open mb-16">
          <h3>{editing ? `Edit ${form.id}` : "Add Trainer"}</h3>
          <div className="grid cols-3 mt-12">
            <div><label className="muted" htmlFor="tr-name">Name *</label><input id="tr-name" className="admin-input" value={form.name} onChange={set("name")} /></div>
            <div><label className="muted" htmlFor="tr-desig">Designation</label><input id="tr-desig" className="admin-input" value={form.designation} onChange={set("designation")} /></div>
            <div>
              <label className="muted" htmlFor="tr-role">Role</label>
              <select id="tr-role" className="admin-input" value={form.role} onChange={set("role")}>{TRAINER_ROLES.map((r) => <option key={r}>{r}</option>)}</select>
            </div>
            <div><label className="muted" htmlFor="tr-appt">Appointment date</label><input id="tr-appt" type="date" className="admin-input" value={form.appointmentDate} onChange={set("appointmentDate")} /></div>
            <div>
              <label className="muted" htmlFor="tr-status">Status</label>
              <select id="tr-status" className="admin-input" value={form.status} onChange={set("status")}><option>Active</option><option>Inactive</option></select>
            </div>
          </div>
          <div className="row-gap mt-12">
            <button className="btn" onClick={handleSave}>{editing ? "Save Changes" : "Add Trainer"}</button>
            <button className="btn secondary" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Designation</th><th>Role</th><th>Appointed</th><th>Sessions logged</th><th>Status</th><th /></tr></thead>
          <tbody>
            {trainers.length === 0 && <tr><td colSpan={8} className="empty-row">No trainers added yet.</td></tr>}
            {trainers.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td><td><strong>{t.name}</strong></td><td>{t.designation || "—"}</td><td>{t.role}</td>
                <td>{formatDate(t.appointmentDate)}</td><td>{sessionsOf(t.id)}</td>
                <td><span className={`pill ${t.status === "Inactive" ? "bad" : "ok"}`}>{t.status || "Active"}</span></td>
                <td>
                  <div className="employee-actions">
                    <button className="btn secondary" onClick={() => setForm({ ...t, existing: true })}>Edit</button>
                    {canDelete && <button className="btn danger" onClick={() => handleDelete(t)}>Delete</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
