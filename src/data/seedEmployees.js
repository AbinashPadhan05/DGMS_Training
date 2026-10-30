import { DEFAULT_SETTINGS } from "../constants/config";
import { addDays, addMonths, monthsAgo, today } from "../utils/dates";
import { newTraining } from "../utils/trainingRecords";

const OPENCAST = [2, 3, 3, 9, 1];
const ABOVEGROUND = [2, 2, 2, 5, 1];
const PARTS = [
  ["Introductory", "Introduction to the mine, PPE, duties and reporting", "TR-001"],
  ["General Safety", "General safety: hazards, first aid, emergencies", "TR-002"],
  ["Trade / Discipline specific", "Trade specific SOPs, COPs and machinery", "TR-002"],
  ["On-the-Job Training", "On-the-job training under an authorized trainer", "TR-003"],
  ["Assessment", "Post-training evaluation", "TR-001"],
];

const workDays = (start, n) => {
  const out = [];
  for (let d = start; out.length < n; d = addDays(d, 1)) if (new Date(`${d}T00:00:00Z`).getUTCDay() !== 0) out.push(d);
  return out;
};

// Sample attendance register and training log for `doneDays` days of an initial training.
function sampleRecords(start, doneDays, counts) {
  const full = Math.floor(doneDays);
  const dates = workDays(start, Math.ceil(doneDays));
  const attendance = dates.map((date, i) => ({ date, status: i < full ? "Present" : "Half day", note: "" }));
  const sessions = [];
  let at = 0;
  PARTS.forEach(([part, topic, trainerId], i) => {
    const take = dates.slice(at, at + counts[i]);
    at += counts[i];
    if (take.length) sessions.push({ id: `S-${i + 1}`, date: take[0], part, topic, trainerId, hours: take.length * 6 });
  });
  return { attendance, sessions };
}

const base = { type: "Regular", grade: "Worker", category: "opencast", highlySkilled: false, email: "", mobile: "", mine: "Bolani", status: "Active" };

// A completed initial training whose refresher falls due in `dueInDays` days (negative = overdue).
const certifiedInitial = (dueInDays, score) => {
  const certDate = addDays(addMonths(today(), -DEFAULT_SETTINGS.refresherMonths), dueInDays);
  const start = addDays(certDate, -25);
  return newTraining("Initial", start, {
    id: "T-1", score, assessmentDate: certDate, attempts: [{ score, date: certDate }],
    practical: "Completed", ojt: "Completed", certDate, completionDate: certDate,
    ...sampleRecords(start, 18, OPENCAST),
  });
};

export const buildSeedEmployees = () => [
  { ...base, name: "Abinash Padhan", id: "EMP-001", course: "General Mine Safety", department: "Mining", designation: "Trainee", username: "employee", password: "employee123", joining: monthsAgo(60), trainings: [{ ...certifiedInitial(18, 86), documents: [{ id: "D-1", name: "Attendance_Sheet_Initial.pdf", type: "Attendance sheet", size: 184320, addedOn: monthsAgo(60) }] }] },
  {
    ...base, name: "Rahul Kumar", id: "EMP-002", course: "General Mine Safety", department: "Mining", designation: "Mining Mate", username: "rahul002", password: "Welcome@123", grade: "Supervisory", joining: monthsAgo(2),
    trainings: [newTraining("Initial", monthsAgo(1), { id: "T-1", ...sampleRecords(monthsAgo(1), 18, OPENCAST), score: 72, assessmentDate: today(), attempts: [{ score: 72, date: today() }], practical: "Completed", ojt: "Pending" })],
  },
  {
    ...base, type: "Contractual", contractor: "Orissa Mining Services", name: "Priya Singh", id: "EMP-003", course: "General Mine Safety", department: "Mining", designation: "Trainee", username: "priya003", password: "Welcome@123", joining: monthsAgo(1),
    trainings: [newTraining("Initial", addDays(today(), -14), { id: "T-1", ...sampleRecords(addDays(today(), -14), 13.5, OPENCAST) })],
  },
  {
    ...base, type: "Contractual", contractor: "Orissa Mining Services", name: "Amit Das", id: "EMP-004", course: "HEMM Operator Training", department: "Mechanical", designation: "Dumper Operator", username: "amit004", password: "Welcome@123", highlySkilled: true, joining: monthsAgo(1),
    trainings: [newTraining("Initial", addDays(today(), -12), { id: "T-1", ...sampleRecords(addDays(today(), -12), 9, OPENCAST), ojt: "In Progress" })],
  },
  { ...base, name: "Sanjay Naik", id: "EMP-005", course: "General Mine Safety", department: "Mining", designation: "Mining Mate", username: "sanjay005", password: "Welcome@123", joining: monthsAgo(66), trainings: [certifiedInitial(-40, 91)] },
  {
    ...base, category: "aboveground", name: "Deepak Mohanty", id: "EMP-006", course: "General Mine Safety", department: "Stores", designation: "Store Keeper", username: "deepak006", password: "Welcome@123", joining: monthsAgo(1),
    trainings: [newTraining("Initial", addDays(today(), -20), { id: "T-1", ...sampleRecords(addDays(today(), -20), 12, ABOVEGROUND), score: 32, assessmentDate: today(), attempts: [{ score: 32, date: today() }], additionalDays: 1, practical: "Completed", ojt: "Completed" })],
  },
];
