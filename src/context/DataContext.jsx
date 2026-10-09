import { createContext, useCallback, useContext, useMemo } from "react";
import { STORAGE_KEYS } from "../constants/config";
import { defaultQuestions } from "../data/defaultQuestions";
import { seedEmployees } from "../data/seedEmployees";
import usePersistentState from "../hooks/usePersistentState";
import { clone, isDuplicate, today, withCertificate } from "../utils/training";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [employees, setEmployees] = usePersistentState(STORAGE_KEYS.employees, (saved) =>
    (Array.isArray(saved) ? saved : clone(seedEmployees)).map(withCertificate)
  );
  const [questions, setQuestions] = usePersistentState(STORAGE_KEYS.questions, (saved) =>
    Array.isArray(saved) && saved.length ? saved : clone(defaultQuestions)
  );

  /* ---------- employees ---------- */
  const addEmployee = useCallback((emp) => setEmployees((list) => [...list, emp]), [setEmployees]);

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
        next.push(e);
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
  const deleteQuestion = useCallback(
    (index) => setQuestions((list) => list.filter((_, i) => i !== index)),
    [setQuestions]
  );
  const resetQuestions = useCallback(() => setQuestions(clone(defaultQuestions)), [setQuestions]);

  const value = useMemo(
    () => ({
      employees, questions,
      addEmployee, addEmployees, updateEmployee, toggleEmployeeStatus, deleteEmployee, submitAssessment,
      addQuestion, deleteQuestion, resetQuestions,
    }),
    [employees, questions, addEmployee, addEmployees, updateEmployee, toggleEmployeeStatus, deleteEmployee, submitAssessment, addQuestion, deleteQuestion, resetQuestions]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
