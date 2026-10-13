const base = { type: "Regular", email: "", mobile: "", joining: "", mine: "Bolani", status: "Active" };

export const seedEmployees = [
  { ...base, name: "Abinash Padhan", id: "EMP-001", course: "General Mine Safety", progress: 100, score: 86, practical: "Completed", ojt: "Completed", certificate: "Issued", department: "Mining", designation: "Trainee", username: "employee", password: "employee123" },
  { ...base, name: "Rahul Kumar", id: "EMP-002", course: "General Mine Safety", progress: 100, score: 72, practical: "Completed", ojt: "Pending", certificate: "Pending", department: "Mining", designation: "Mining Mate", username: "rahul002", password: "Welcome@123" },
  { ...base, type: "Contractual", contractor: "Orissa Mining Services", name: "Priya Singh", id: "EMP-003", course: "General Mine Safety", progress: 75, score: null, practical: "Pending", ojt: "Pending", certificate: "Pending", department: "Mining", designation: "Trainee", username: "priya003", password: "Welcome@123" },
  { ...base, type: "Contractual", contractor: "Orissa Mining Services", name: "Amit Das", id: "EMP-004", course: "HEMM Operator Training", progress: 50, score: null, practical: "Pending", ojt: "In Progress", certificate: "Pending", department: "Mechanical", designation: "Operator", username: "amit004", password: "Welcome@123" },
  { ...base, name: "Sanjay Naik", id: "EMP-005", course: "General Mine Safety", progress: 100, score: 91, practical: "Completed", ojt: "Completed", certificate: "Issued", department: "Mining", designation: "Mining Mate", username: "sanjay005", password: "Welcome@123" },
];
