import { useState } from "react";
import { STEP_STATUSES } from "../../constants/config";
import { hasScore, progressOf, today } from "../../utils/training";

// Mount with key={employee.id} so the form resets when a different employee is chosen.
export default function RecordEditor({ employee, onSave, onClose }) {
  const [progress, setProgress] = useState(String(progressOf(employee)));
  const [practical, setPractical] = useState(employee.practical || "Pending");
  const [ojt, setOjt] = useState(employee.ojt || "Pending");
  const [score, setScore] = useState(hasScore(employee) ? String(Number(employee.score)) : "");

  const handleSave = () => {
    const p = Number(progress);
    const raw = score.trim();
    if (progress === "" || !(p >= 0 && p <= 100)) {
      alert("Training progress must be between 0 and 100.");
      return;
    }
    if (raw !== "" && !(Number(raw) >= 0 && Number(raw) <= 100)) {
      alert("Assessment score must be between 0 and 100.");
      return;
    }

    const newScore = raw === "" ? null : Math.round(Number(raw));
    const oldScore = hasScore(employee) ? Number(employee.score) : null;
    const patch = { progress: Math.round(p), practical, ojt, score: newScore };
    if (newScore !== oldScore) patch.assessmentDate = newScore === null ? "" : today();
    onSave(employee.id, patch);
  };

  return (
    <div className="panel open">
      <h3>Update Training Record – {employee.name} ({employee.id})</h3>
      <div className="grid cols-4 mt-12">
        <div>
          <label className="muted" htmlFor="recProgress">Training Progress (%)</label>
          <input id="recProgress" type="number" min="0" max="100" className="admin-input" value={progress} onChange={(e) => setProgress(e.target.value)} />
        </div>
        <div>
          <label className="muted" htmlFor="recPractical">Practical</label>
          <select id="recPractical" className="admin-input" value={practical} onChange={(e) => setPractical(e.target.value)}>
            {STEP_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="muted" htmlFor="recOjt">OJT</label>
          <select id="recOjt" className="admin-input" value={ojt} onChange={(e) => setOjt(e.target.value)}>
            {STEP_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="muted" htmlFor="recScore">Assessment Score (%) – optional</label>
          <input id="recScore" type="number" min="0" max="100" className="admin-input" placeholder="Leave blank if not attempted" value={score} onChange={(e) => setScore(e.target.value)} />
        </div>
      </div>
      <div className="muted">
        Certificate is issued automatically once the assessment is passed and both Practical and OJT are Completed.
      </div>
      <div className="row-gap mt-15">
        <button className="btn" onClick={handleSave}>Save Update</button>
        <button className="btn secondary" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
