// Source: DGMS (Legislative) Circular No. 01 of 2026 dated 25.08.2026 – Guidelines for preparation of training scheme.

// Minimum days per part (circular table, para 2.1).
// Initial = introductory + general safety + trade specific + OJT + assessment.
// Refresher = training + assessment.
export const CATEGORIES = [
  { key: "aboveground", label: "Aboveground Mines", initial: { introductory: 2, general: 2, trade: 2, ojt: 5, assessment: 1 }, refresher: { training: 2.5, assessment: 0.5 } },
  { key: "opencast", label: "Opencast Mines (Coal & Metal)", initial: { introductory: 2, general: 3, trade: 3, ojt: 9, assessment: 1 }, refresher: { training: 3.5, assessment: 0.5 } },
  { key: "underground", label: "Underground Mines (Coal & Metal)", initial: { introductory: 2, general: 6, trade: 5, ojt: 10, assessment: 1 }, refresher: { training: 5.5, assessment: 0.5 } },
  { key: "gassy", label: "Underground Coal Mines (Gassy Degree II & III)", initial: { introductory: 2, general: 9, trade: 6, ojt: 12, assessment: 1 }, refresher: { training: 5.5, assessment: 0.5 } },
  { key: "onshore", label: "Onshore Oil Mines", initial: { introductory: 2, general: 6, trade: 5, ojt: 10, assessment: 1 }, refresher: { training: 5.5, assessment: 0.5 } },
  { key: "offshore", label: "Off-Shore Oil Mines", initial: { introductory: 2, general: 9, trade: 6, ojt: 12, assessment: 1 }, refresher: { training: 5.5, assessment: 0.5 } },
];

export const INITIAL_PARTS = [
  ["introductory", "Introductory"],
  ["general", "General Safety"],
  ["trade", "Trade / Discipline specific"],
  ["ojt", "On-the-Job Training"],
  ["assessment", "Assessment"],
];

export const TRAINING_TYPES = [
  { key: "Initial", label: "Initial (Rule 158)", short: "Initial" },
  { key: "Refresher", label: "Refresher (Rule 159)", short: "Refresher" },
  { key: "Special", label: "Special – new technology / equipment (Rule 161)", short: "Special" },
  { key: "Absence", label: "After long absence – over 1 year (Rule 162)", short: "After absence" },
  { key: "Accident", label: "After accident / dangerous occurrence (Rule 162)", short: "After accident" },
  { key: "JobChange", label: "After change of job (Rule 162)", short: "Job change" },
  { key: "Other", label: "Other / need-based", short: "Other" },
];

// Types with a fixed statutory minimum of 3 days (circular paras 1.4, 1.5, 3.6).
export const MIN_THREE_DAY_TYPES = ["Special", "Absence", "Accident", "JobChange"];

// Additional training after scoring below the pass mark (circular: 2 days after initial, 1 day after refresher).
export const ADDITIONAL_TRAINING_DAYS = { Initial: 2, Refresher: 1 };

export const GRADES = ["Worker", "Supervisory", "Managerial"];
export const FIELD_TEST_STATUSES = ["Pending", "Passed", "Failed"];

/* ---------- Round 2: records, attendance, trainers, retention ---------- */
export const ATTENDANCE_STATUSES = [
  { key: "Present", days: 1 },
  { key: "Half day", days: 0.5 },
  { key: "Absent", days: 0 },
  { key: "Leave", days: 0 },
];
export const SESSION_PARTS = ["Introductory", "General Safety", "Trade / Discipline specific", "On-the-Job Training", "Assessment", "Refresher", "Special / other"];
export const DOCUMENT_TYPES = ["Attendance sheet", "Assessment sheet", "Certificate scan", "Trainer appointment", "Other"];
export const TRAINER_ROLES = ["Training Officer", "Instructor", "Trainer", "OJT Trainer (authorized)", "Supervisor"];
// Circular section 5.0: keep records for the whole service and at least 5 years after.
export const RETENTION_YEARS = 5;
