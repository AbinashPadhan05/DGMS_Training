import { createContext, useCallback, useContext, useMemo } from "react";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../constants/config";
import { defaultQuestions } from "../data/defaultQuestions";
import { seedCirculars } from "../data/seedCirculars";
import { buildSeedEmployees } from "../data/seedEmployees";
import { seedManagers } from "../data/seedManagers";
import { seedTrainers } from "../data/seedTrainers";
import usePersistentState from "../hooks/usePersistentState";
import { getAuditActor, makeAuditEntry, MAX_AUDIT_ENTRIES } from "../utils/audit";
import { today } from "../utils/dates";
import { setActiveSettings } from "../utils/settings";
import { clone, isDuplicate } from "../utils/training";
import { activeTraining, canPurge, finalize, newTraining, patchTraining, retainUntilFor, setAttendanceFor, withAttendance } from "../utils/trainingRecords";

const DataContext = createContext(null);

const mergeSettings = (saved) => ({
  ...DEFAULT_SETTINGS,
  ...(saved && typeof saved === "object" ? saved : {}),
  admin: { ...DEFAULT_SETTINGS.admin, ...(saved?.admin || {}) },
});

const FIELD_NAMES = {
  daysCompleted: "days completed", score: "score", practical: "practical", ojt: "OJT", fieldTest: "field test",
  additionalDays: "additional training days", startDate: "start date", completionDate: "completion date", customDays: "required days", notes: "notes",
};
const describePatch = (patch) =>
  Object.entries(patch)
    .filter(([k]) => FIELD_NAMES[k])
    .map(([k, v]) => `${FIELD_NAMES[k]} = ${v === null || v === "" ? "—" : v}`)
    .join("; ");

let idSeq = 0;
const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${(idSeq++).toString(36)}`;

export function DataProvider({ children }) {
  const [settings, setSettings] = usePersistentState(STORAGE_KEYS.settings, mergeSettings);
  // Keep the pass mark etc. readable by plain helper functions before children render.
  setActiveSettings(settings);

  const [employees, setEmployees] = usePersistentState(STORAGE_KEYS.employees, (saved) =>
    finalize(Array.isArray(saved) ? saved : buildSeedEmployees())
  );
  const [questions, setQuestions] = usePersistentState(STORAGE_KEYS.questions, (saved) =>
    Array.isArray(saved) && saved.length ? saved : clone(defaultQuestions)
  );
  const [managers, setManagers] = usePersistentState(STORAGE_KEYS.managers, (saved) =>
    Array.isArray(saved) ? saved : clone(seedManagers)
  );
  const [circulars, setCirculars] = usePersistentState(STORAGE_KEYS.circulars, (saved) =>
    Array.isArray(saved) ? saved : clone(seedCirculars)
  );
  const [trainers, setTrainers] = usePersistentState(STORAGE_KEYS.trainers, (saved) =>
    Array.isArray(saved) ? saved : clone(seedTrainers)
  );
  const [auditLog, setAuditLog] = usePersistentState(STORAGE_KEYS.audit, (saved) => (Array.isArray(saved) ? saved : []));

  /* ---------- audit log ---------- */
  const audit = useCallback(
    (action, target, detail) => setAuditLog((log) => [makeAuditEntry(action, target, detail), ...log].slice(0, MAX_AUDIT_ENTRIES)),
    [setAuditLog]
  );
  const who = useCallback(
    (id) => {
      const e = employees.find((x) => x.id === id);
      return e ? `${e.id} – ${e.name}` : id;
    },
    [employees]
  );

  /* ---------- employees ---------- */
  const addEmployee = useCallback(
    (emp) => {
      setEmployees((list) => finalize([...list, emp]));
      audit("Employee added", `${emp.id} – ${emp.name}`, `${emp.type || "Regular"}, category ${emp.category || "not set"}`);
    },
    [setEmployees, audit]
  );

  // Adds only valid, non-duplicate rows. Returns { added, skipped }.
  const addEmployees = useCallback(
    (incoming) => {
      const next = [...employees];
      let added = 0;
      let skipped = 0;
      incoming.forEach((e) => {
        if (!e.id || !e.name || !e.username || isDuplicate(next, e.id, e.username)) {
          skipped++;
          return;
        }
        next.push({ ...e, trainings: e.trainings || [newTraining("Initial", e.joining || "")] });
        added++;
      });
      setEmployees(finalize(next));
      audit("Employees imported", `${added} added`, skipped ? `${skipped} skipped` : "");
      return { added, skipped };
    },
    [employees, setEmployees, audit]
  );

  // Profile fields only. Training data goes through updateTraining.
  const updateEmployee = useCallback(
    (id, patch) => {
      setEmployees((list) => finalize(list.map((e) => (e.id === id ? { ...e, ...patch } : e))));
      const keys = Object.keys(patch).filter((k) => k !== "password");
      audit("Employee updated", who(id), `${keys.join(", ")}${"password" in patch ? " (password changed)" : ""}`);
    },
    [setEmployees, audit, who]
  );

  const toggleEmployeeStatus = useCallback(
    (id) => {
      const e = employees.find((x) => x.id === id);
      setEmployees((list) => list.map((x) => (x.id === id ? { ...x, status: x.status === "Inactive" ? "Active" : "Inactive" } : x)));
      audit(e?.status === "Inactive" ? "Employee activated" : "Employee deactivated", who(id));
    },
    [employees, setEmployees, audit, who]
  );

  // Records are kept (retention: service + 5 years); the employee is only hidden from the working lists.
  const archiveEmployee = useCallback(
    (id, { leavingDate, reason }) => {
      const archived = { date: today(), leavingDate, reason: reason || "", retainUntil: retainUntilFor(leavingDate), by: getAuditActor().name };
      setEmployees((list) => list.map((e) => (e.id === id ? { ...e, archived, status: "Inactive" } : e)));
      audit("Employee archived", who(id), `left ${leavingDate}; retain until ${archived.retainUntil}${reason ? `; ${reason}` : ""}`);
    },
    [setEmployees, audit, who]
  );

  const restoreEmployee = useCallback(
    (id) => {
      setEmployees((list) => list.map((e) => {
        if (e.id !== id) return e;
        const { archived, ...rest } = e; // eslint-disable-line no-unused-vars
        return { ...rest, status: "Active" };
      }));
      audit("Employee restored from archive", who(id));
    },
    [setEmployees, audit, who]
  );

  // Returns an error message when deletion is not allowed, otherwise null.
  const deleteEmployee = useCallback(
    (id) => {
      const e = employees.find((x) => x.id === id);
      if (!e) return null;
      const check = canPurge(e);
      if (!check.ok) return check.reason;
      setEmployees((list) => list.filter((x) => x.id !== id));
      audit("Employee deleted permanently", `${e.id} – ${e.name}`);
      return null;
    },
    [employees, setEmployees, audit]
  );

  /* ---------- training records (several per employee; the latest one is the active one) ---------- */
  const addTraining = useCallback(
    (empId, training, reason = "") => {
      setEmployees((list) => finalize(list.map((e) => (e.id === empId ? { ...e, trainings: [...(e.trainings || []), training] } : e))));
      audit("Training record created", who(empId), `${training.type}${training.startDate ? `, start ${training.startDate}` : ""}${reason ? `; ${reason}` : ""}`);
    },
    [setEmployees, audit, who]
  );

  // fn gets the training record and returns the new one.
  const changeTraining = useCallback(
    (empId, trainingId, fn) =>
      setEmployees((list) =>
        finalize(list.map((e) => (e.id === empId ? { ...e, trainings: e.trainings.map((t) => (t.id === trainingId ? fn(t) : t)) } : e)))
      ),
    [setEmployees]
  );

  const updateTraining = useCallback(
    (empId, trainingId, patch) => {
      changeTraining(empId, trainingId, (t) => patchTraining(t, patch));
      audit("Training record updated", who(empId), describePatch(patch));
    },
    [changeTraining, audit, who]
  );

  const deleteTraining = useCallback(
    (empId, trainingId) => {
      setEmployees((list) =>
        finalize(list.map((e) => (e.id === empId && e.trainings.length > 1 ? { ...e, trainings: e.trainings.filter((t) => t.id !== trainingId) } : e)))
      );
      audit("Training record deleted", who(empId), trainingId);
    },
    [setEmployees, audit, who]
  );

  // Attendance register, training log and documents of a training record.
  // entries: one { date, status, note } or an array of them (a range entered at once).
  const addAttendance = useCallback(
    (empId, tid, entries) => {
      const list = Array.isArray(entries) ? entries : [entries];
      changeTraining(empId, tid, (t) => {
        const dates = new Set(list.map((a) => a.date));
        return withAttendance(t, [...(t.attendance || []).filter((a) => !dates.has(a.date)), ...list]);
      });
      audit("Attendance recorded", who(empId), list.length === 1 ? `${list[0].date}: ${list[0].status}` : `${list.length} days (${list[0].date} to ${list[list.length - 1].date}): ${list[0].status}`);
    },
    [changeTraining, audit, who]
  );
  const removeAttendance = useCallback(
    (empId, tid, date) => {
      changeTraining(empId, tid, (t) => setAttendanceFor(t, { date, status: "" }));
      audit("Attendance removed", who(empId), date);
    },
    [changeTraining, audit, who]
  );
  // One day's attendance for many employees at once. rows: [{ empId, trainingId, status, note }]; empty status clears the day.
  const markAttendanceBulk = useCallback(
    (date, rows) => {
      const byEmp = new Map(rows.map((r) => [r.empId, r]));
      setEmployees((list) =>
        finalize(list.map((e) => {
          const r = byEmp.get(e.id);
          if (!r) return e;
          return { ...e, trainings: e.trainings.map((t) => (t.id === r.trainingId ? setAttendanceFor(t, { date, status: r.status, note: r.note || "" }) : t)) };
        }))
      );
      const count = (st) => rows.filter((r) => r.status === st).length;
      audit("Attendance sheet saved", date, `${rows.length} employee(s): present ${count("Present")}, half day ${count("Half day")}, absent ${count("Absent")}, leave ${count("Leave")}, cleared ${rows.filter((r) => !r.status).length}`);
    },
    [setEmployees, audit]
  );

  const addSession = useCallback(
    (empId, tid, session) => {
      changeTraining(empId, tid, (t) => ({ ...t, sessions: [...(t.sessions || []), { id: newId("S"), ...session }].sort((a, b) => (a.date < b.date ? -1 : 1)) }));
      audit("Training session logged", who(empId), `${session.date}: ${session.part}${session.topic ? ` – ${session.topic}` : ""}`);
    },
    [changeTraining, audit, who]
  );
  const removeSession = useCallback(
    (empId, tid, sessionId) => {
      changeTraining(empId, tid, (t) => ({ ...t, sessions: (t.sessions || []).filter((s) => s.id !== sessionId) }));
      audit("Training session removed", who(empId), sessionId);
    },
    [changeTraining, audit, who]
  );
  const addDocument = useCallback(
    (empId, tid, doc) => {
      changeTraining(empId, tid, (t) => ({ ...t, documents: [...(t.documents || []), { id: newId("D"), addedOn: today(), ...doc }] }));
      audit("Document attached", who(empId), `${doc.type}: ${doc.name}`);
    },
    [changeTraining, audit, who]
  );
  const removeDocument = useCallback(
    (empId, tid, docId) => {
      changeTraining(empId, tid, (t) => ({ ...t, documents: (t.documents || []).filter((d) => d.id !== docId) }));
      audit("Document removed", who(empId), docId);
    },
    [changeTraining, audit, who]
  );

  // Online assessment result for the employee's active training.
  const submitAssessment = useCallback(
    (id, score) => {
      setEmployees((list) =>
        finalize(list.map((e) => {
          if (e.id !== id) return e;
          const active = activeTraining(e);
          return { ...e, trainings: e.trainings.map((t) => (t.id === active.id ? patchTraining(t, { score }) : t)) };
        }))
      );
      audit("Online assessment submitted", who(id), `score ${score}%`);
    },
    [setEmployees, audit, who]
  );

  /* ---------- questions ---------- */
  const addQuestion = useCallback((q) => { setQuestions((list) => [...list, q]); audit("Question added", "", q.q.slice(0, 80)); }, [setQuestions, audit]);
  const updateQuestion = useCallback(
    (index, q) => { setQuestions((list) => list.map((x, i) => (i === index ? q : x))); audit("Question edited", `#${index + 1}`, q.q.slice(0, 80)); },
    [setQuestions, audit]
  );
  const deleteQuestion = useCallback(
    (index) => { setQuestions((list) => list.filter((_, i) => i !== index)); audit("Question deleted", `#${index + 1}`); },
    [setQuestions, audit]
  );
  const resetQuestions = useCallback(() => { setQuestions(clone(defaultQuestions)); audit("Question bank reset"); }, [setQuestions, audit]);

  /* ---------- managers (admin only) ---------- */
  const addManager = useCallback((m) => { setManagers((list) => [...list, m]); audit("Manager added", `${m.id} – ${m.name}`); }, [setManagers, audit]);
  const updateManager = useCallback(
    (id, patch) => { setManagers((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m))); audit("Manager updated", id, Object.keys(patch).filter((k) => k !== "password").join(", ")); },
    [setManagers, audit]
  );
  const deleteManager = useCallback((id) => { setManagers((list) => list.filter((m) => m.id !== id)); audit("Manager deleted", id); }, [setManagers, audit]);

  /* ---------- trainers & instructors register ---------- */
  const addTrainer = useCallback((t) => { setTrainers((list) => [...list, t]); audit("Trainer added", `${t.id} – ${t.name}`, t.role); }, [setTrainers, audit]);
  const updateTrainer = useCallback(
    (id, patch) => { setTrainers((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t))); audit("Trainer updated", id, Object.keys(patch).join(", ")); },
    [setTrainers, audit]
  );
  // Returns an error message when the trainer appears in training logs (deactivate instead).
  const deleteTrainer = useCallback(
    (id) => {
      const used = employees.some((e) => e.trainings.some((t) => (t.sessions || []).some((s) => s.trainerId === id)));
      if (used) return "This trainer appears in training logs. Mark the trainer Inactive instead of deleting.";
      setTrainers((list) => list.filter((t) => t.id !== id));
      audit("Trainer deleted", id);
      return null;
    },
    [employees, setTrainers, audit]
  );

  /* ---------- circulars & syllabus ---------- */
  const addCircular = useCallback((c) => { setCirculars((list) => [...list, c]); audit("Circular added", `${c.id} – ${c.title}`); }, [setCirculars, audit]);
  const updateCircular = useCallback(
    (id, patch) => { setCirculars((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c))); audit("Circular updated", id); },
    [setCirculars, audit]
  );
  const deleteCircular = useCallback((id) => { setCirculars((list) => list.filter((c) => c.id !== id)); audit("Circular deleted", id); }, [setCirculars, audit]);

  /* ---------- settings / backup ---------- */
  const updateSettings = useCallback(
    (patch) => {
      const next = mergeSettings({ ...settings, ...patch, admin: { ...settings.admin, ...(patch.admin || {}) } });
      setActiveSettings(next); // pass mark etc. must be current before certificates are re-derived
      setSettings(next);
      setEmployees((list) => finalize(list));
      audit("Settings changed", "", Object.keys(patch).map((k) => (k === "admin" ? "administrator account" : k)).join(", "));
    },
    [settings, setSettings, setEmployees, audit]
  );

  const exportBackup = useCallback(
    () => ({ version: 2, savedAt: new Date().toISOString(), settings, employees, questions, managers, circulars, trainers, auditLog }),
    [settings, employees, questions, managers, circulars, trainers, auditLog]
  );

  // Returns an error message, or null on success.
  const restoreBackup = useCallback(
    (data) => {
      if (!data || !Array.isArray(data.employees) || !Array.isArray(data.questions)) return "This is not a valid backup file.";
      setEmployees(finalize(data.employees));
      if (data.questions.length) setQuestions(data.questions);
      if (Array.isArray(data.managers)) setManagers(data.managers);
      if (Array.isArray(data.circulars)) setCirculars(data.circulars);
      if (Array.isArray(data.trainers)) setTrainers(data.trainers);
      if (Array.isArray(data.auditLog)) setAuditLog(data.auditLog);
      if (data.settings) setSettings(mergeSettings(data.settings));
      audit("Backup restored", "", `saved ${data.savedAt || ""}`);
      return null;
    },
    [setEmployees, setQuestions, setManagers, setCirculars, setTrainers, setAuditLog, setSettings, audit]
  );

  // The audit log is kept when sample data is restored.
  const resetAllData = useCallback(() => {
    setEmployees(finalize(buildSeedEmployees()));
    setQuestions(clone(defaultQuestions));
    setManagers(clone(seedManagers));
    setCirculars(clone(seedCirculars));
    setTrainers(clone(seedTrainers));
    audit("All data reset to sample data");
  }, [setEmployees, setQuestions, setManagers, setCirculars, setTrainers, audit]);

  const value = useMemo(
    () => ({
      settings, employees, questions, managers, circulars, trainers, auditLog,
      addEmployee, addEmployees, updateEmployee, toggleEmployeeStatus, archiveEmployee, restoreEmployee, deleteEmployee,
      addTraining, updateTraining, deleteTraining, submitAssessment,
      addAttendance, removeAttendance, markAttendanceBulk, addSession, removeSession, addDocument, removeDocument,
      addQuestion, updateQuestion, deleteQuestion, resetQuestions,
      addManager, updateManager, deleteManager,
      addTrainer, updateTrainer, deleteTrainer,
      addCircular, updateCircular, deleteCircular,
      updateSettings, exportBackup, restoreBackup, resetAllData,
    }),
    [
      settings, employees, questions, managers, circulars, trainers, auditLog,
      addEmployee, addEmployees, updateEmployee, toggleEmployeeStatus, archiveEmployee, restoreEmployee, deleteEmployee,
      addTraining, updateTraining, deleteTraining, submitAssessment,
      addAttendance, removeAttendance, markAttendanceBulk, addSession, removeSession, addDocument, removeDocument,
      addQuestion, updateQuestion, deleteQuestion, resetQuestions,
      addManager, updateManager, deleteManager,
      addTrainer, updateTrainer, deleteTrainer,
      addCircular, updateCircular, deleteCircular,
      updateSettings, exportBackup, restoreBackup, resetAllData,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
