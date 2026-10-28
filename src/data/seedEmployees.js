import { DEFAULT_SETTINGS } from "../constants/config";
import { addDays, addMonths, monthsAgo, today } from "../utils/dates";
import { newTraining } from "../utils/trainingRecords";

const base = { type: "Regular", grade: "Worker", category: "opencast", highlySkilled: false, email: "", mobile: "", mine: "Bolani", status: "Active" };

// A completed initial training whose refresher falls due in `dueInDays` days (negative = overdue).
const certifiedInitial = (dueInDays, score) => {
  const certDate = addDays(addMonths(today(), -DEFAULT_SETTINGS.refresherMonths), dueInDays);
  return newTraining("Initial", addDays(certDate, -25), {
    id: "T-1", daysCompleted: 18, score, assessmentDate: certDate, attempts: [{ score, date: certDate }],
    practical: "Completed", ojt: "Completed", certDate, completionDate: certDate,
  });
};

export const buildSeedEmployees = () => [
  { ...base, name: "Abinash Padhan", id: "EMP-001", course: "General Mine Safety", department: "Mining", designation: "Trainee", username: "employee", password: "employee123", joining: monthsAgo(60), trainings: [certifiedInitial(18, 86)] },
  {
    ...base, name: "Rahul Kumar", id: "EMP-002", course: "General Mine Safety", department: "Mining", designation: "Mining Mate", username: "rahul002", password: "Welcome@123", grade: "Supervisory", joining: monthsAgo(2),
    trainings: [newTraining("Initial", monthsAgo(1), { id: "T-1", daysCompleted: 18, score: 72, assessmentDate: today(), attempts: [{ score: 72, date: today() }], practical: "Completed", ojt: "Pending" })],
  },
  {
    ...base, type: "Contractual", contractor: "Orissa Mining Services", name: "Priya Singh", id: "EMP-003", course: "General Mine Safety", department: "Mining", designation: "Trainee", username: "priya003", password: "Welcome@123", joining: monthsAgo(1),
    trainings: [newTraining("Initial", addDays(today(), -14), { id: "T-1", daysCompleted: 13.5 })],
  },
  {
    ...base, type: "Contractual", contractor: "Orissa Mining Services", name: "Amit Das", id: "EMP-004", course: "HEMM Operator Training", department: "Mechanical", designation: "Dumper Operator", username: "amit004", password: "Welcome@123", highlySkilled: true, joining: monthsAgo(1),
    trainings: [newTraining("Initial", addDays(today(), -12), { id: "T-1", daysCompleted: 9, ojt: "In Progress" })],
  },
  { ...base, name: "Sanjay Naik", id: "EMP-005", course: "General Mine Safety", department: "Mining", designation: "Mining Mate", username: "sanjay005", password: "Welcome@123", joining: monthsAgo(66), trainings: [certifiedInitial(-40, 91)] },
  {
    ...base, category: "aboveground", name: "Deepak Mohanty", id: "EMP-006", course: "General Mine Safety", department: "Stores", designation: "Store Keeper", username: "deepak006", password: "Welcome@123", joining: monthsAgo(1),
    trainings: [newTraining("Initial", addDays(today(), -20), { id: "T-1", daysCompleted: 12, score: 32, assessmentDate: today(), attempts: [{ score: 32, date: today() }], additionalDays: 1, practical: "Completed", ojt: "Completed" })],
  },
];
