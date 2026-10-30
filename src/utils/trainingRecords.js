import { ADDITIONAL_TRAINING_DAYS, ATTENDANCE_STATUSES, CATEGORIES, MIN_THREE_DAY_TYPES, RETENTION_YEARS } from "../constants/training";
import { addMonths, daysBetween, today } from "./dates";
import { getPassMark, getRefresherMonths } from "./settings";

const hasNum = (v) => v !== null && v !== undefined && v !== "" && !Number.isNaN(Number(v));

export const categoryOf = (e) => CATEGORIES.find((c) => c.key === e.category);
export const categoryLabel = (e) => categoryOf(e)?.label || "Not set";

let seq = 0;
const newId = () => `T-${Date.now().toString(36)}${(seq++).toString(36)}`;

export function newTraining(type = "Initial", startDate = "", extra = {}) {
  return {
    id: newId(), type, startDate, completionDate: "", daysCompleted: null, customDays: null,
    progressManual: 0, score: null, assessmentDate: "", attempts: [], additionalDays: 0,
    practical: "Pending", ojt: "Pending", fieldTest: "Pending", notes: "", certDate: "", certNo: "",
    attendance: [], sessions: [], documents: [],
    ...extra,
  };
}

// Required (minimum) days for a training record, or null when it cannot be worked out yet.
export function requiredDaysFor(e, t) {
  const cat = categoryOf(e);
  if (t.type === "Initial") return cat ? Object.values(cat.initial).reduce((a, b) => a + b, 0) : null;
  if (t.type === "Refresher") return cat ? Object.values(cat.refresher).reduce((a, b) => a + b, 0) : null;
  const custom = hasNum(t.customDays) ? Number(t.customDays) : null;
  if (MIN_THREE_DAY_TYPES.includes(t.type)) return Math.max(3, custom ?? 3);
  return custom; // "Other": decided by the employer
}

export function derivePassed(score) {
  return hasNum(score) && Number(score) >= getPassMark();
}

// Days attended according to the attendance register (null when nothing is recorded).
export function attendanceDays(t) {
  const list = t.attendance || [];
  if (!list.length) return null;
  return list.reduce((n, a) => n + (ATTENDANCE_STATUSES.find((s) => s.key === a.status)?.days || 0), 0);
}

export function deriveTraining(e, t) {
  const required = requiredDaysFor(e, t);
  // The attendance register, when used, decides the days completed.
  const fromRegister = attendanceDays(t);
  const days = fromRegister !== null ? fromRegister : hasNum(t.daysCompleted) ? Number(t.daysCompleted) : null;
  const progress =
    required && days !== null
      ? Math.max(0, Math.min(100, Math.round((days / required) * 100)))
      : Math.max(0, Math.min(100, Number(t.progressManual) || 0));

  const scored = hasNum(t.score);
  const passed = derivePassed(t.score);
  const fieldRequired = !!e.highlySkilled;
  const fieldTest = fieldRequired ? t.fieldTest || "Pending" : "Not required";
  const daysOk = required && days !== null ? days >= required : true;

  let evalStatus = "Not attempted";
  if (scored && passed) evalStatus = "Passed";
  else if (scored) {
    const need = ADDITIONAL_TRAINING_DAYS[t.type] || 0;
    evalStatus = need > 0 && (Number(t.additionalDays) || 0) < need ? "Additional training required" : "Re-evaluation due";
  }

  const eligible = passed && t.practical === "Completed" && t.ojt === "Completed" && (!fieldRequired || fieldTest === "Passed") && daysOk;

  return {
    ...t,
    attendance: t.attendance || [],
    sessions: t.sessions || [],
    documents: t.documents || [],
    daysCompleted: days,
    daysFromRegister: fromRegister !== null,
    requiredDays: required,
    progress,
    evalStatus,
    fieldTest,
    certificate: eligible ? "Issued" : "Pending",
    certDate: eligible ? t.certDate || today() : "",
    certNo: eligible ? t.certNo || "" : "",
  };
}

// Builds the first training record of an employee from the older single-record fields.
function migrateLegacy(e) {
  const scored = hasNum(e.score);
  return newTraining("Initial", e.joining || "", {
    id: "T-1",
    progressManual: Number(e.progress) || 0,
    score: scored ? Number(e.score) : null,
    assessmentDate: e.assessmentDate || "",
    attempts: scored ? [{ score: Number(e.score), date: e.assessmentDate || "" }] : [],
    practical: e.practical || "Pending",
    ojt: e.ojt || "Pending",
    certDate: e.certDate || "",
    completionDate: e.certDate || "",
  });
}

export const activeTraining = (e) => (e.trainings && e.trainings.length ? e.trainings[e.trainings.length - 1] : null);

// Normalises an employee: derives every training record and mirrors the latest one onto the
// employee (progress, score, practical, ojt, certificate ...) so the rest of the UI can read it directly.
export function deriveEmployee(e) {
  const base = { type: "Regular", grade: "Worker", category: "", highlySkilled: false, ...e };
  const raw = Array.isArray(base.trainings) && base.trainings.length ? base.trainings : [migrateLegacy(base)];
  const trainings = raw.map((t) => deriveTraining(base, t));
  const a = trainings[trainings.length - 1];
  return {
    ...base,
    trainings,
    trainingType: a.type,
    requiredDays: a.requiredDays,
    daysCompleted: hasNum(a.daysCompleted) ? Number(a.daysCompleted) : null,
    progress: a.progress,
    score: hasNum(a.score) ? Number(a.score) : null,
    assessmentDate: a.assessmentDate || "",
    practical: a.practical,
    ojt: a.ojt,
    fieldTest: a.fieldTest,
    evalStatus: a.evalStatus,
    certificate: a.certificate,
    certDate: a.certDate,
    certNo: a.certNo,
  };
}

// Applies a patch to one training record, keeping the assessment attempt history consistent.
export function patchTraining(t, patch) {
  const next = { ...t, ...patch };
  if ("score" in patch) {
    const had = hasNum(t.score) ? Number(t.score) : null;
    const now = hasNum(patch.score) ? Number(patch.score) : null;
    if (now !== had) {
      next.score = now;
      if (now === null) {
        next.assessmentDate = "";
      } else {
        next.assessmentDate = today();
        next.attempts = [...(t.attempts || []), { score: now, date: today() }];
        if (now < getPassMark()) next.additionalDays = 0;
      }
    }
  }
  return next;
}

/* ---------- refresher due date (evaluated at render time) ---------- */

// Refresher is counted from the latest completed (certified) Initial or Refresher training.
export function refresherInfo(e) {
  const done = (e.trainings || [])
    .filter((t) => (t.type === "Initial" || t.type === "Refresher") && t.certificate === "Issued" && t.certDate)
    .sort((a, b) => (a.certDate < b.certDate ? 1 : -1))[0];
  if (!done) return { status: "none", label: "Initial pending", due: "", daysLeft: null };

  const due = addMonths(done.certDate, getRefresherMonths());
  const daysLeft = daysBetween(today(), due);

  // A refresher already in progress after the last completed one is on its way.
  const open = (e.trainings || []).some((t) => t.type === "Refresher" && t.certificate !== "Issued" && t.startDate >= done.certDate);
  if (daysLeft < 0) return { status: "overdue", label: `Overdue by ${-daysLeft} days`, due, daysLeft, inProgress: open };
  if (daysLeft <= 30) return { status: "soon", label: `Due in ${daysLeft} days`, due, daysLeft, inProgress: open };
  return { status: "ok", label: "Up to date", due, daysLeft, inProgress: open };
}

export const needsReevaluation = (e) => e.evalStatus === "Additional training required" || e.evalStatus === "Re-evaluation due";

// Re-derives every employee and gives each newly issued certificate the next serial number.
export function finalize(list) {
  let max = 0;
  list.forEach((e) => (e.trainings || []).forEach((t) => {
    const m = /(\d+)$/.exec(t.certNo || "");
    if (m) max = Math.max(max, Number(m[1]));
  }));
  return list.map((e) => {
    const d = deriveEmployee(e);
    if (!d.trainings.some((t) => t.certificate === "Issued" && !t.certNo)) return d;
    const trainings = d.trainings.map((t) => {
      if (t.certificate !== "Issued" || t.certNo) return t;
      max += 1;
      return { ...t, certNo: `MM/CERT/${(t.certDate || today()).slice(0, 4)}/${String(max).padStart(4, "0")}` };
    });
    return deriveEmployee({ ...d, trainings });
  });
}


/* ---------- retention (circular section 5.0) ---------- */

// Archived employees keep their records until 5 years after the service end date.
export function retentionInfo(e) {
  if (!e.archived) return { archived: false, label: `Service period + ${RETENTION_YEARS} years`, until: "", purgeable: false };
  const until = e.archived.retainUntil || addMonths(e.archived.leavingDate || e.archived.date, RETENTION_YEARS * 12);
  return { archived: true, label: `Retain until ${until}`, until, purgeable: !!until && until <= today() };
}

export const retainUntilFor = (leavingDate) => addMonths(leavingDate, RETENTION_YEARS * 12);

// Permanent deletion is only allowed for records made by mistake (nothing recorded) or after the retention period.
export function canPurge(e) {
  const empty = (e.trainings || []).every(
    (t) => !t.attendance?.length && !t.sessions?.length && !t.documents?.length && (t.score === null || t.score === undefined) && t.certificate !== "Issued"
  ) && (e.trainings || []).length <= 1;
  if (empty) return { ok: true };
  const r = retentionInfo(e);
  if (!r.archived) return { ok: false, reason: "Training records must be kept for the whole service and 5 years after it. Archive the employee instead of deleting." };
  if (!r.purgeable) return { ok: false, reason: `Records must be retained until ${r.until}. They cannot be deleted before that date.` };
  return { ok: true };
}
