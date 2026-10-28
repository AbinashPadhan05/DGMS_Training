import { today } from "./dates";
import { deriveEmployee, refresherInfo } from "./trainingRecords";
import { getPassMark } from "./settings";

export { today };

export const clone = (x) => JSON.parse(JSON.stringify(x));

export const hasScore = (e) => e.score !== null && e.score !== undefined && e.score !== "";
export const isPassed = (e) => hasScore(e) && Number(e.score) >= getPassMark();
export const progressOf = (e) => Math.max(0, Math.min(100, Number(e.progress) || 0));

export function assessmentLabel(e) {
  if (!hasScore(e)) return "Not attempted";
  return isPassed(e) ? `Passed (${Number(e.score)}%)` : `Failed (${Number(e.score)}%)`;
}

// Derives certificate, progress and the active training record (see trainingRecords.js).
export const withCertificate = deriveEmployee;

export function pillKind(text) {
  const t = text || "Pending";
  if (["Completed", "Issued", "Up to date"].includes(t) || t.startsWith("Passed")) return "ok";
  if (t.startsWith("Failed")) return "bad";
  if (["In Progress", "Due soon", "Additional training required", "Re-evaluation due"].includes(t) || t.startsWith("Due in")) return "warn";
  if (t.startsWith("Overdue")) return "bad";
  return "";
}

const same = (a, b) => String(a ?? "").toLowerCase() === String(b ?? "").toLowerCase();

export const idExists = (list, id) => list.some((x) => same(x.id, id));
export const usernameExists = (list, username) => list.some((x) => same(x.username, username));
export const isDuplicate = (list, id, username) => idExists(list, id) || usernameExists(list, username);

export const typeOf = (e) => (e.type === "Contractual" ? "Contractual" : "Regular");

export function filterEmployees(list, search, filter, type = "all") {
  const q = search.trim().toLowerCase();
  return list.filter((e) => {
    if (type !== "all" && typeOf(e) !== type) return false;
    if (q && !`${e.name || ""} ${e.id || ""} ${e.department || ""}`.toLowerCase().includes(q)) return false;
    const p = progressOf(e);
    switch (filter) {
      case "completed": return p >= 100;
      case "progress": return p > 0 && p < 100;
      case "passed": return isPassed(e);
      case "pending": return !isPassed(e);
      case "practical": return e.practical !== "Completed";
      case "ojt": return e.ojt !== "Completed";
      case "certificate": return e.certificate === "Issued";
      case "inactive": return e.status === "Inactive";
      case "refresherDue": return ["soon", "overdue"].includes(refresherInfo(e).status);
      case "refresherOverdue": return refresherInfo(e).status === "overdue";
      case "reeval": return e.evalStatus === "Additional training required" || e.evalStatus === "Re-evaluation due";
      default: return true;
    }
  });
}

export function computeStats(employees) {
  const count = (fn) => employees.filter(fn).length;
  return {
    total: employees.length,
    regular: count((e) => typeOf(e) === "Regular"),
    contractual: count((e) => typeOf(e) === "Contractual"),
    completed: count((e) => progressOf(e) >= 100),
    passed: count(isPassed),
    certificates: count((e) => e.certificate === "Issued"),
    inProgress: count((e) => progressOf(e) > 0 && progressOf(e) < 100),
    practical: count((e) => e.practical === "Completed"),
    ojt: count((e) => e.ojt === "Completed"),
    certPending: count((e) => e.certificate !== "Issued"),
    refresherSoon: count((e) => refresherInfo(e).status === "soon"),
    refresherOverdue: count((e) => refresherInfo(e).status === "overdue"),
    reeval: count((e) => e.evalStatus === "Additional training required" || e.evalStatus === "Re-evaluation due"),
    categoryMissing: count((e) => !e.category),
  };
}
