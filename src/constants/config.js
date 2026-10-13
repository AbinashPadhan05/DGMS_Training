export const STORAGE_KEYS = {
  employees: "mineMagmaEmployees",
  questions: "mineMagmaQuestions",
  managers: "mineMagmaManagers",
  circulars: "mineMagmaCirculars",
  settings: "mineMagmaSettings",
  session: "mineMagmaSession",
};

// Demo only. Real authentication must be done on a server.
export const DEFAULT_SETTINGS = {
  passMark: 40,
  defaultCourse: "General Mine Safety",
  defaultPassword: "Welcome@123",
  admin: { name: "MineMagma Administrator", username: "admin", password: "admin123" },
};

export const DEFAULT_COURSE = DEFAULT_SETTINGS.defaultCourse;
export const DEFAULT_PASSWORD = DEFAULT_SETTINGS.defaultPassword;

export const ADMIN_PATH = "/admin";

export const EMPLOYEE_TYPES = ["Regular", "Contractual"];

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
