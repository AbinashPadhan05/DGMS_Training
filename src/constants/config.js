export const PASS_MARK = 40;

export const STORAGE_KEYS = {
  employees: "mineMagmaEmployees",
  questions: "mineMagmaQuestions",
  session: "mineMagmaSession",
};

// Demo only. Real authentication must be done on a server.
export const DEMO_ADMIN = {
  username: "admin",
  password: "admin123",
  name: "MineMagma Administrator",
};

export const DEFAULT_COURSE = "General Mine Safety";
export const DEFAULT_PASSWORD = "Welcome@123";

export const STEP_STATUSES = ["Pending", "In Progress", "Completed"];

export const EMPLOYEE_FILTERS = [
  { value: "all", label: "All Status" },
  { value: "completed", label: "Training Completed" },
  { value: "progress", label: "Training In Progress" },
  { value: "passed", label: "Assessment Passed" },
  { value: "pending", label: "Assessment Pending / Failed" },
  { value: "practical", label: "Practical Pending" },
  { value: "ojt", label: "OJT Pending" },
  { value: "certificate", label: "Certificate Issued" },
  { value: "inactive", label: "Inactive Employees" },
];
