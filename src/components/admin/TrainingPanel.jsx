import { useState } from "react";
import { STEP_STATUSES } from "../../constants/config";
import { ADDITIONAL_TRAINING_DAYS, CATEGORIES, FIELD_TEST_STATUSES, GRADES, INITIAL_PARTS, MIN_THREE_DAY_TYPES, TRAINING_TYPES } from "../../constants/training";
import { useData } from "../../context/DataContext";
import { formatDate, today } from "../../utils/dates";
import { getPassMark } from "../../utils/settings";
import { activeTraining, newTraining } from "../../utils/trainingRecords";
import Pill from "../common/Pill";

const typeShort = (key) => TRAINING_TYPES.find((t) => t.key === key)?.short || key;
const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
const dayText = (t) => `${t.daysCompleted ?? "—"} / ${t.requiredDays ?? "—"} days`;
const statusOf = (t) => (t.progress >= 100 ? "Completed" : t.progress > 0 ? "In Progress" : "Pending");

function RequiredParts({ employee, training }) {
  const cat = CATEGORIES.find((c) => c.key === employee.category);
  if (!cat || !["Initial", "Refresher"].includes(training.type)) return null;
  const parts = training.type === "Initial"
    ? INITIAL_PARTS.map(([k, label]) => [label, cat.initial[k]])
    : [["Training", cat.refresher.training], ["Assessment", cat.refresher.assessment]];
  return (
    <div className="parts" style={{ gridTemplateColumns: `repeat(${parts.length}, 1fr)` }}>
      {parts.map(([label, d]) => <div className="part" key={label}><strong>{d}</strong>{label} (days)</div>)}
    </div>
  );
}

// Mount with key={training.id} so the form resets when another record is chosen.
function TrainingEditor({ employee, training, onSave }) {
  const [f, setF] = useState({
    startDate: training.startDate || "",
    completionDate: training.completionDate || "",
    daysCompleted: training.daysCompleted ?? "",
    customDays: training.customDays ?? "",
    practical: training.practical || "Pending",
    ojt: training.ojt || "Pending",
    fieldTest: training.fieldTest === "Not required" ? "Pending" : training.fieldTest || "Pending",
    score: training.score ?? "",
    additionalDays: training.additionalDays ?? 0,
    notes: training.notes || "",
  });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const customEditable = training.type === "Other" || MIN_THREE_DAY_TYPES.includes(training.type);
  const failed = training.evalStatus === "Additional training required" || training.evalStatus === "Re-evaluation due";
  const addNeed = ADDITIONAL_TRAINING_DAYS[training.type] || 0;

  const handleSave = () => {
    const days = num(f.daysCompleted);
    const score = num(f.score);
    if (days !== null && !(days >= 0)) { alert("Days completed cannot be negative."); return; }
    if (score !== null && !(score >= 0 && score <= 100)) { alert("Assessment score must be between 0 and 100."); return; }
    if (customEditable && num(f.customDays) !== null && MIN_THREE_DAY_TYPES.includes(training.type) && num(f.customDays) < 3) {
      alert("This training type needs at least 3 days."); return;
    }
    onSave({
      startDate: f.startDate, completionDate: f.completionDate, daysCompleted: days,
      customDays: customEditable ? num(f.customDays) : training.customDays,
      practical: f.practical, ojt: f.ojt, fieldTest: f.fieldTest,
      score: score === null ? null : Math.round(score),
      additionalDays: Number(f.additionalDays) || 0, notes: f.notes.trim(),
    });
  };

  return (
    <div className="panel open">
      <h4 style={{ margin: 0 }}>{typeShort(training.type)} training {training.startDate ? `– started ${formatDate(training.startDate)}` : ""}</h4>

      {!employee.category && training.type !== "Other" && !MIN_THREE_DAY_TYPES.includes(training.type) && (
        <div className="alert warn">Select the mine category above to get the required number of days for this training.</div>
      )}
      <RequiredParts employee={employee} training={training} />

      <div className="grid cols-4 mt-12">
        <div><label className="muted" htmlFor="tr-start">Start date</label><input id="tr-start" type="date" className="admin-input" value={f.startDate} onChange={set("startDate")} /></div>
        <div>
          <label className="muted" htmlFor="tr-days">Days completed {training.requiredDays ? `(min ${training.requiredDays})` : ""}</label>
          <input id="tr-days" type="number" min="0" step="0.5" className="admin-input" value={f.daysCompleted} onChange={set("daysCompleted")} />
        </div>
        {customEditable && (
          <div>
            <label className="muted" htmlFor="tr-custom">Required days {MIN_THREE_DAY_TYPES.includes(training.type) ? "(min 3)" : "(as decided)"}</label>
            <input id="tr-custom" type="number" min="0" step="0.5" className="admin-input" placeholder={MIN_THREE_DAY_TYPES.includes(training.type) ? "3" : "Enter days"} value={f.customDays} onChange={set("customDays")} />
          </div>
        )}
        <div><label className="muted" htmlFor="tr-prac">Practical</label>
          <select id="tr-prac" className="admin-input" value={f.practical} onChange={set("practical")}>{STEP_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label className="muted" htmlFor="tr-ojt">OJT</label>
          <select id="tr-ojt" className="admin-input" value={f.ojt} onChange={set("ojt")}>{STEP_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
        {employee.highlySkilled && (
          <div><label className="muted" htmlFor="tr-field">Practical field test</label>
            <select id="tr-field" className="admin-input" value={f.fieldTest} onChange={set("fieldTest")}>{FIELD_TEST_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
        )}
        <div><label className="muted" htmlFor="tr-score">Assessment score (%) – optional</label>
          <input id="tr-score" type="number" min="0" max="100" className="admin-input" placeholder="Blank if not attempted" value={f.score} onChange={set("score")} /></div>
        {failed && addNeed > 0 && (
          <div><label className="muted" htmlFor="tr-add">Additional training days done (need {addNeed})</label>
            <input id="tr-add" type="number" min="0" step="0.5" className="admin-input" value={f.additionalDays} onChange={set("additionalDays")} /></div>
        )}
        <div><label className="muted" htmlFor="tr-done">Completion date</label><input id="tr-done" type="date" className="admin-input" value={f.completionDate} onChange={set("completionDate")} /></div>
      </div>

      <label className="muted" htmlFor="tr-notes">Notes</label>
      <input id="tr-notes" className="admin-input" placeholder="Trainer, batch, remarks…" value={f.notes} onChange={set("notes")} />

      {failed && (
        <div className="alert warn">
          Scored below the pass mark ({getPassMark()}%).{" "}
          {addNeed > 0 ? `Additional training of at least ${addNeed} day(s) is required, then re-evaluation.` : "Re-evaluation is due."}{" "}
          Status: <strong>{training.evalStatus}</strong>. Enter the new score after re-evaluation.
        </div>
      )}
      {(training.attempts || []).length > 0 && (
        <div className="muted">Assessment attempts: {training.attempts.map((a, i) => `#${i + 1} ${a.score}%${a.date ? ` (${formatDate(a.date)})` : ""}`).join(" · ")}</div>
      )}
      <div className="muted mt-12">Certificate is issued automatically once the assessment is passed, minimum days are completed, and Practical, OJT{employee.highlySkilled ? " and the field test" : ""} are done.</div>
      <div className="row-gap mt-15"><button className="btn" onClick={handleSave}>Save Record</button></div>
    </div>
  );
}

export default function TrainingPanel({ employee, canDelete, onClose }) {
  const { updateEmployee, addTraining, updateTraining, deleteTraining } = useData();
  const active = activeTraining(employee);
  const [selectedId, setSelectedId] = useState(active.id);
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState("Refresher");
  const [newStart, setNewStart] = useState(today());

  const selected = employee.trainings.find((t) => t.id === selectedId) || active;

  const handleAdd = () => {
    const t = newTraining(newType, newStart);
    addTraining(employee.id, t);
    setSelectedId(t.id);
    setAdding(false);
  };

  const handleDelete = (t) => {
    if (employee.trainings.length <= 1) { alert("An employee must keep at least one training record."); return; }
    if (!window.confirm(`Delete this ${typeShort(t.type)} training record?`)) return;
    deleteTraining(employee.id, t.id);
    setSelectedId(active.id);
  };

  return (
    <div className="panel open">
      <div className="section-title">
        <h3>Training records – {employee.name} ({employee.id})</h3>
        <button className="btn secondary" onClick={onClose}>Close</button>
      </div>

      <div className="grid cols-3 mt-0">
        <div>
          <label className="muted" htmlFor="tp-cat">Mine category</label>
          <select id="tp-cat" className="admin-input" value={employee.category || ""} onChange={(e) => updateEmployee(employee.id, { category: e.target.value })}>
            <option value="">— Select —</option>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="muted" htmlFor="tp-grade">Grade</label>
          <select id="tp-grade" className="admin-input" value={employee.grade || "Worker"} onChange={(e) => updateEmployee(employee.id, { grade: e.target.value })}>
            {GRADES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="muted" htmlFor="tp-skill">Highly skilled category</label>
          <label className="check-row" htmlFor="tp-skill">
            <input id="tp-skill" type="checkbox" checked={!!employee.highlySkilled} onChange={(e) => updateEmployee(employee.id, { highlySkilled: e.target.checked })} />
            Practical field test required
          </label>
        </div>
      </div>

      <div className="mt-12">
        {employee.trainings.map((t) => (
          <div key={t.id} className={`rec-row ${t.id === selected.id ? "active" : ""}`}>
            <div>
              <strong>{typeShort(t.type)}</strong> {t.id === active.id && <span className="pill">Active</span>}
              <div className="admin-row-meta">{t.startDate ? `Started ${formatDate(t.startDate)}` : "Start date not set"}</div>
            </div>
            <div>{dayText(t)}<div className="admin-row-meta">{t.progress}%</div></div>
            <div><Pill text={statusOf(t)} /></div>
            <div><Pill text={t.certificate} /></div>
            <div className="row-gap">
              <button className="btn" onClick={() => setSelectedId(t.id)}>Edit</button>
              {canDelete && <button className="btn danger" onClick={() => handleDelete(t)}>Delete</button>}
            </div>
          </div>
        ))}
      </div>

      <div className="row-gap mt-12">
        <button className="btn secondary" onClick={() => setAdding((v) => !v)}>+ New training</button>
      </div>
      {adding && (
        <div className="panel open">
          <div className="grid cols-3 mt-0">
            <div>
              <label className="muted" htmlFor="nt-type">Training type</label>
              <select id="nt-type" className="admin-input" value={newType} onChange={(e) => setNewType(e.target.value)}>
                {TRAINING_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div><label className="muted" htmlFor="nt-start">Start date</label><input id="nt-start" type="date" className="admin-input" value={newStart} onChange={(e) => setNewStart(e.target.value)} /></div>
          </div>
          <div className="muted">The newest record becomes the employee's active training. Earlier records stay in the history.</div>
          <div className="row-gap mt-12">
            <button className="btn" onClick={handleAdd}>Create record</button>
            <button className="btn secondary" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      <TrainingEditor key={selected.id} employee={employee} training={selected} onSave={(patch) => updateTraining(employee.id, selected.id, patch)} />
    </div>
  );
}
