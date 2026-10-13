import { createContext, useCallback, useContext, useMemo } from "react";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../constants/config";
import { defaultQuestions } from "../data/defaultQuestions";
import { seedCirculars } from "../data/seedCirculars";
import { seedEmployees } from "../data/seedEmployees";
import { seedManagers } from "../data/seedManagers";
import usePersistentState from "../hooks/usePersistentState";
import { setActiveSettings } from "../utils/settings";
import { clone, isDuplicate, today, withCertificate } from "../utils/training";

const DataContext = createContext(null);

const mergeSettings = (saved) => ({
  ...DEFAULT_SETTINGS,
  ...(saved && typeof saved === "object" ? saved : {}),
  admin: { ...DEFAULT_SETTINGS.admin, ...(saved?.admin || {}) },
});

export function DataProvider({ children }) {
  const [settings, setSettings] = usePersistentState(STORAGE_KEYS.settings, mergeSettings);
  // Keep the pass mark etc. readable by plain helper functions before children render.
  setActiveSettings(settings);

  const [employees, setEmployees] = usePersistentState(STORAGE_KEYS.employees, (saved) =>
    (Array.isArray(saved) ? saved : clone(seedEmployees)).map(withCertificate)
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

  /* ---------- employees ---------- */
  const addEmployee = useCallback((emp) => setEmployees((list) => [...list, withCertificate(emp)]), [setEmployees]);

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
        next.push(withCertificate(e));
        added++;
      });
      setEmployees(next);
      return { added, skipped };
    },
    [employees, setEmployees]
  );

  const updateEmployee = useCallback(
    (id, patch) =>
      setEmployees((list) => list.map((e) => (e.id === id ? withCertificate({ ...e, ...patch }) : e))),
    [setEmployees]
  );

  const toggleEmployeeStatus = useCallback(
    (id) =>
      setEmployees((list) =>
        list.map((e) => (e.id === id ? { ...e, status: e.status === "Inactive" ? "Active" : "Inactive" } : e))
      ),
    [setEmployees]
  );

  const deleteEmployee = useCallback(
    (id) => setEmployees((list) => list.filter((e) => e.id !== id)),
    [setEmployees]
  );

  const submitAssessment = useCallback(
    (id, score) => updateEmployee(id, { score, assessmentDate: today() }),
    [updateEmployee]
  );

  /* ---------- questions ---------- */
  const addQuestion = useCallback((q) => setQuestions((list) => [...list, q]), [setQuestions]);
  const updateQuestion = useCallback(
    (index, q) => setQuestions((list) => list.map((x, i) => (i === index ? q : x))),
    [setQuestions]
  );
  const deleteQuestion = useCallback(
    (index) => setQuestions((list) => list.filter((_, i) => i !== index)),
    [setQuestions]
  );
  const resetQuestions = useCallback(() => setQuestions(clone(defaultQuestions)), [setQuestions]);

  /* ---------- managers (admin only) ---------- */
  const addManager = useCallback((m) => setManagers((list) => [...list, m]), [setManagers]);
  const updateManager = useCallback(
    (id, patch) => setManagers((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m))),
    [setManagers]
  );
  const deleteManager = useCallback((id) => setManagers((list) => list.filter((m) => m.id !== id)), [setManagers]);

  /* ---------- circulars & syllabus ---------- */
  const addCircular = useCallback((c) => setCirculars((list) => [...list, c]), [setCirculars]);
  const updateCircular = useCallback(
    (id, patch) => setCirculars((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    [setCirculars]
  );
  const deleteCircular = useCallback((id) => setCirculars((list) => list.filter((c) => c.id !== id)), [setCirculars]);

  /* ---------- settings / backup ---------- */
  const updateSettings = useCallback(
    (patch) => setSettings((s) => mergeSettings({ ...s, ...patch, admin: { ...s.admin, ...(patch.admin || {}) } })),
    [setSettings]
  );

  const exportBackup = useCallback(
    () => ({ version: 1, savedAt: new Date().toISOString(), settings, employees, questions, managers, circulars }),
    [settings, employees, questions, managers, circulars]
  );

  // Returns an error message, or null on success.
  const restoreBackup = useCallback(
    (data) => {
      if (!data || !Array.isArray(data.employees) || !Array.isArray(data.questions)) return "This is not a valid backup file.";
      setEmployees(data.employees.map(withCertificate));
      if (data.questions.length) setQuestions(data.questions);
      if (Array.isArray(data.managers)) setManagers(data.managers);
      if (Array.isArray(data.circulars)) setCirculars(data.circulars);
      if (data.settings) setSettings(mergeSettings(data.settings));
      return null;
    },
    [setEmployees, setQuestions, setManagers, setCirculars, setSettings]
  );

  const resetAllData = useCallback(() => {
    setEmployees(clone(seedEmployees).map(withCertificate));
    setQuestions(clone(defaultQuestions));
    setManagers(clone(seedManagers));
    setCirculars(clone(seedCirculars));
  }, [setEmployees, setQuestions, setManagers, setCirculars]);

  const value = useMemo(
    () => ({
      settings, employees, questions, managers, circulars,
      addEmployee, addEmployees, updateEmployee, toggleEmployeeStatus, deleteEmployee, submitAssessment,
      addQuestion, updateQuestion, deleteQuestion, resetQuestions,
      addManager, updateManager, deleteManager,
      addCircular, updateCircular, deleteCircular,
      updateSettings, exportBackup, restoreBackup, resetAllData,
    }),
    [
      settings, employees, questions, managers, circulars,
      addEmployee, addEmployees, updateEmployee, toggleEmployeeStatus, deleteEmployee, submitAssessment,
      addQuestion, updateQuestion, deleteQuestion, resetQuestions,
      addManager, updateManager, deleteManager,
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
