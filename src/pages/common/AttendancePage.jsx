import { useMemo, useState } from "react";
import Pill from "../../components/common/Pill";
import TypePill from "../../components/common/TypePill";
import { ATTENDANCE_STATUSES, CATEGORIES, TRAINING_TYPES } from "../../constants/training";
import { useData } from "../../context/DataContext";
import { formatDate, today } from "../../utils/dates";
import { activeTraining, categoryLabel } from "../../utils/trainingRecords";

const STATUS_KIND = { Present: "ok", "Half day": "warn", Absent: "bad", Leave: "bad" };
const isSunday = (iso) => new Date(`${iso}T00:00:00Z`).getUTCDay() === 0;
const same = (a, b) => (a?.status || "") === (b?.status || "") && (a?.note || "") === (b?.note || "");

// Day-wise attendance for many employees at once (manager and admin).
export default function AttendancePage() {
  const { employees, markAttendanceBulk } = useData();
  const [date, setDate] = useState(today());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [draft, setDraft] = useState({}); // empId -> { status, note } for rows changed on this sheet
  const [savedMsg, setSavedMsg] = useState("");

  const stored = (e) => {
    const a = activeTraining(e).attendance?.find((x) => x.date === date);
    return a ? { status: a.status, note: a.note || "" } : { status: "", note: "" };
  };
  const valueOf = (e) => draft[e.id] ?? stored(e);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      if (e.archived || e.status === "Inactive") return false;
      if (!showAll && activeTraining(e).certificate === "Issued") return false;
      if (category !== "all" && e.category !== category) return false;
      return !q || `${e.name} ${e.id} ${e.department || ""}`.toLowerCase().includes(q);
    });
  }, [employees, search, category, showAll]);

  const dirty = employees.filter((e) => draft[e.id] && !same(draft[e.id], stored(e)));

  const setRow = (e, patch) => setDraft((d) => ({ ...d, [e.id]: { ...valueOf(e), ...patch } }));

  const changeDate = (next) => {
    if (dirty.length && !window.confirm("You have unsaved changes for this date. Discard them?")) return;
    setDraft({});
    setSavedMsg("");
    setDate(next);
  };

  const markUnmarkedPresent = () =>
    setDraft((d) => {
      const next = { ...d };
      rows.forEach((e) => { if (!valueOf(e).status) next[e.id] = { ...valueOf(e), status: "Present" }; });
      return next;
    });

  const save = () => {
    if (date > today()) { alert("Attendance cannot be marked for a future date."); return; }
    if (!dirty.length) { alert("Nothing to save."); return; }
    markAttendanceBulk(date, dirty.map((e) => ({ empId: e.id, trainingId: activeTraining(e).id, status: draft[e.id].status, note: draft[e.id].note.trim() })));
    setDraft({});
    setSavedMsg(`Attendance saved for ${dirty.length} employee(s) on ${formatDate(date)}.`);
  };

  const counts = ATTENDANCE_STATUSES.map((s) => [s.key, rows.filter((e) => valueOf(e).status === s.key).length]);
  const unmarked = rows.filter((e) => !valueOf(e).status).length;

  return (
    <section>
      <div className="section-title">
        <div>
          <h2>Attendance</h2>
          <div className="muted">Mark one day's attendance for many employees at once. It goes into each employee's attendance register and updates days completed.</div>
        </div>
      </div>

      <div className="card">
        <div className="row-gap wrap mb-16">
          <div>
            <label className="muted" htmlFor="att-date">Date</label>
            <input id="att-date" type="date" className="toolbar-input block" max={today()} value={date} onChange={(e) => changeDate(e.target.value)} />
          </div>
          <div className="grow">
            <label className="muted" htmlFor="att-search">Search</label>
            <input id="att-search" className="toolbar-input block full" placeholder="Employee / ID / department…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label className="muted" htmlFor="att-cat">Mine category</label>
            <select id="att-cat" className="toolbar-input block" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <label className="check-row" htmlFor="att-all">
          <input id="att-all" type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          Show all active employees (default: only those whose training is still running)
        </label>

        {isSunday(date) && <div className="alert warn">{formatDate(date)} is a Sunday. Mark attendance only if training was actually held.</div>}
        {savedMsg && <div className="alert ok">{savedMsg}</div>}

        <div className="row-gap wrap" style={{ alignItems: "center" }}>
          {counts.map(([k, n]) => <span key={k} className={`pill ${STATUS_KIND[k]}`}>{k}: {n}</span>)}
          <span className="pill">Not marked: {unmarked}</span>
          <span className="muted">{rows.length} employee(s)</span>
        </div>

        <div className="row-gap wrap mt-12">
          <button className="btn secondary" onClick={markUnmarkedPresent} disabled={!unmarked}>Mark all unmarked as Present</button>
          <button className="btn" onClick={save} disabled={!dirty.length}>Save attendance{dirty.length ? ` (${dirty.length} change${dirty.length > 1 ? "s" : ""})` : ""}</button>
          {dirty.length > 0 && <button className="btn secondary" onClick={() => setDraft({})}>Discard changes</button>}
        </div>

        <div className="table-wrap mt-12">
          <table>
            <thead>
              <tr><th>Employee</th><th>Training</th><th>Days so far</th><th>Attendance on {formatDate(date)}</th><th>Remark</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={5} className="empty-row">No employees to show. {showAll ? "" : "Tick “Show all active employees” to include completed trainings."}</td></tr>}
              {rows.map((e) => {
                const t = activeTraining(e);
                const v = valueOf(e);
                const changed = !!draft[e.id] && !same(draft[e.id], stored(e));
                return (
                  <tr key={e.id} className={changed ? "row-changed" : ""}>
                    <td>
                      <strong>{e.name}</strong> <TypePill employee={e} />
                      <div className="admin-row-meta">{e.id} • {categoryLabel(e)}</div>
                    </td>
                    <td>
                      {TRAINING_TYPES.find((x) => x.key === t.type)?.short}
                      {t.startDate && date < t.startDate && <div><span className="pill warn">Before start {formatDate(t.startDate)}</span></div>}
                      {t.certificate === "Issued" && <div><Pill text="Certified" kind="ok" /></div>}
                    </td>
                    <td>{e.daysCompleted ?? 0} / {e.requiredDays ?? "—"}</td>
                    <td>
                      <select className="admin-input att-select" value={v.status} aria-label={`Attendance of ${e.name}`} onChange={(ev) => setRow(e, { status: ev.target.value })}>
                        <option value="">— Not marked —</option>
                        {ATTENDANCE_STATUSES.map((s) => <option key={s.key}>{s.key}</option>)}
                      </select>
                    </td>
                    <td><input className="admin-input" placeholder="Optional" value={v.note} aria-label={`Remark for ${e.name}`} onChange={(ev) => setRow(e, { note: ev.target.value })} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
