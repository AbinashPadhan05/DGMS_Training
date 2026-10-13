import { getPassMark } from "./settings";

export const clone = (x) => JSON.parse(JSON.stringify(x));
export const today = () => new Date().toISOString().slice(0, 10);

export const hasScore = (e) => e.score !== null && e.score !== undefined && e.score !== "";
export const isPassed = (e) => hasScore(e) && Number(e.score) >= getPassMark();
export const progressOf = (e) => Math.max(0, Math.min(100, Number(e.progress) || 0));

export function assessmentLabel(e) {
  if (!hasScore(e)) return "Not attempted";
  return isPassed(e) ? `Passed (${Number(e.score)}%)` : `Failed (${Number(e.score)}%)`;
}

// Certificate is issued automatically: assessment passed + practical + OJT completed.
export function withCertificate(e) {
  const eligible = isPassed(e) && e.practical === "Completed" && e.ojt === "Completed";
  return {
    ...e,
    certificate: eligible ? "Issued" : "Pending",
    certDate: eligible ? e.certDate || today() : "",
  };
}

export function pillKind(text) {
  const t = text || "Pending";
  if (["Completed", "Issued"].includes(t) || t.startsWith("Passed")) return "ok";
  if (t.startsWith("Failed")) return "bad";
  if (t === "In Progress") return "warn";
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
  };
}
