import { useState } from "react";
import { ATTENDANCE_STATUSES, DOCUMENT_TYPES, SESSION_PARTS } from "../../constants/training";
import { useData } from "../../context/DataContext";
import { addDays, formatDate, today } from "../../utils/dates";
import Pill from "../common/Pill";

const isSunday = (iso) => new Date(`${iso}T00:00:00Z`).getUTCDay() === 0;

export function AttendanceSection({ employee, training }) {
  const { addAttendance, removeAttendance } = useData();
  const [date, setDate] = useState(today());
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("Present");
  const [note, setNote] = useState("");

  const handleAdd = () => {
    if (!date) { alert("Select a date."); return; }
    if (!to) {
      addAttendance(employee.id, training.id, { date, status, note: note.trim() });
    } else {
      if (to < date) { alert("'To' date must not be before the 'From' date."); return; }
      const entries = [];
      for (let d = date; d <= to && entries.length < 60; d = addDays(d, 1)) if (!isSunday(d)) entries.push({ date: d, status, note: note.trim() });
      if (!entries.length) { alert("No working days (Sundays are skipped) in that range."); return; }
      addAttendance(employee.id, training.id, entries);
    }
    setNote("");
  };

  const list = [...(training.attendance || [])].reverse();
  return (
    <div>
      <div className="muted">
        {training.daysFromRegister
          ? <>Days completed are calculated from this register: <strong>{training.daysCompleted}</strong> of {training.requiredDays ?? "—"} required days.</>
          : "No attendance recorded yet. Once you add entries, days completed are calculated from the register."}
      </div>
      <div className="grid cols-4 mt-12">
        <div><label className="muted" htmlFor="at-date">Date / from</label><input id="at-date" type="date" className="admin-input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div><label className="muted" htmlFor="at-to">To (optional range, Sundays skipped)</label><input id="at-to" type="date" className="admin-input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div>
          <label className="muted" htmlFor="at-status">Status</label>
          <select id="at-status" className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>{ATTENDANCE_STATUSES.map((s) => <option key={s.key}>{s.key}</option>)}</select>
        </div>
        <div><label className="muted" htmlFor="at-note">Remark</label><input id="at-note" className="admin-input" value={note} onChange={(e) => setNote(e.target.value)} /></div>
      </div>
      <button className="btn" onClick={handleAdd}>{to ? "Add range" : "Add / update day"}</button>
      {list.length > 0 && (
        <div className="table-wrap scroll-box mt-12">
          <table>
            <thead><tr><th>Date</th><th>Status</th><th>Remark</th><th /></tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.date}>
                  <td>{formatDate(a.date)}</td>
                  <td><Pill text={a.status} kind={a.status === "Present" ? "ok" : a.status === "Half day" ? "warn" : "bad"} /></td>
                  <td>{a.note || "—"}</td>
                  <td><button className="btn danger btn-sm" onClick={() => removeAttendance(employee.id, training.id, a.date)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function SessionsSection({ employee, training }) {
  const { trainers, addSession, removeSession } = useData();
  const [f, setF] = useState({ date: today(), part: SESSION_PARTS[0], topic: "", trainerId: "", hours: "" });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const trainerOf = (id) => trainers.find((t) => t.id === id);

  const handleAdd = () => {
    if (!f.date || !f.part) { alert("Date and module are required."); return; }
    addSession(employee.id, training.id, { date: f.date, part: f.part, topic: f.topic.trim(), trainerId: f.trainerId, hours: f.hours === "" ? "" : Number(f.hours) });
    setF((x) => ({ ...x, topic: "", hours: "" }));
  };

  return (
    <div>
      <div className="grid cols-4 mt-0">
        <div><label className="muted" htmlFor="se-date">Date</label><input id="se-date" type="date" className="admin-input" value={f.date} onChange={set("date")} /></div>
        <div>
          <label className="muted" htmlFor="se-part">Module / part</label>
          <select id="se-part" className="admin-input" value={f.part} onChange={set("part")}>{SESSION_PARTS.map((p) => <option key={p}>{p}</option>)}</select>
        </div>
        <div><label className="muted" htmlFor="se-topic">Topic</label><input id="se-topic" className="admin-input" value={f.topic} onChange={set("topic")} /></div>
        <div>
          <label className="muted" htmlFor="se-trainer">Trainer</label>
          <select id="se-trainer" className="admin-input" value={f.trainerId} onChange={set("trainerId")}>
            <option value="">— Not set —</option>
            {trainers.filter((t) => t.status !== "Inactive").map((t) => <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
          </select>
        </div>
        <div><label className="muted" htmlFor="se-hours">Hours</label><input id="se-hours" type="number" min="0" step="0.5" className="admin-input" value={f.hours} onChange={set("hours")} /></div>
      </div>
      <button className="btn" onClick={handleAdd}>Add to training log</button>
      {(training.sessions || []).length > 0 && (
        <div className="table-wrap scroll-box mt-12">
          <table>
            <thead><tr><th>Date</th><th>Module</th><th>Topic</th><th>Trainer</th><th>Hours</th><th /></tr></thead>
            <tbody>
              {[...training.sessions].reverse().map((s) => {
                const tr = trainerOf(s.trainerId);
                const ojtWarn = s.part === "On-the-Job Training" && tr && !["OJT Trainer (authorized)", "Supervisor"].includes(tr.role);
                return (
                  <tr key={s.id}>
                    <td>{formatDate(s.date)}</td>
                    <td>{s.part}</td>
                    <td className="wrap-cell">{s.topic || "—"}</td>
                    <td>
                      {tr ? <>{tr.name}<div className="admin-row-meta">{tr.role}</div></> : "—"}
                      {ojtWarn && <div><span className="pill warn">Not an authorized OJT trainer</span></div>}
                    </td>
                    <td>{s.hours === "" || s.hours === undefined ? "—" : s.hours}</td>
                    <td><button className="btn danger btn-sm" onClick={() => removeSession(employee.id, training.id, s.id)}>Remove</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const sizeText = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export function DocumentsSection({ employee, training }) {
  const { addDocument, removeDocument } = useData();
  const [type, setType] = useState(DOCUMENT_TYPES[0]);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    addDocument(employee.id, training.id, { name: file.name, size: file.size, type });
  };

  return (
    <div>
      <div className="alert warn">Demo: only the file name, type and size are stored in this browser. The file itself is not uploaded or saved. A real deployment needs file storage.</div>
      <div className="row-gap wrap">
        <select className="toolbar-input" value={type} onChange={(e) => setType(e.target.value)} aria-label="Document type">{DOCUMENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        <label className="btn pointer">📎 Attach document<input type="file" onChange={handleFile} hidden /></label>
      </div>
      {(training.documents || []).length > 0 && (
        <div className="table-wrap mt-12">
          <table>
            <thead><tr><th>Document</th><th>Type</th><th>Size</th><th>Added</th><th /></tr></thead>
            <tbody>
              {training.documents.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td><td>{d.type}</td><td>{d.size ? sizeText(d.size) : "—"}</td><td>{formatDate(d.addedOn)}</td>
                  <td><button className="btn danger btn-sm" onClick={() => removeDocument(employee.id, training.id, d.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
