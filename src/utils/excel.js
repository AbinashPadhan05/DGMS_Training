import { DEFAULT_COURSE, DEFAULT_PASSWORD } from "../constants/config";
import { parseCSV, downloadCSV } from "./csv";
import { assessmentLabel, progressOf, today } from "./training";

export const TEMPLATE_HEADERS = [
  "Employee ID", "Name", "Department", "Designation", "Mine / Site", "Email", "Mobile",
  "Joining Date", "Training Programme", "Username", "Temporary Password", "Status",
];

// xlsx is loaded only when needed, so it stays out of the main bundle.
async function loadXLSX() {
  try {
    return await import("xlsx");
  } catch {
    return null;
  }
}

export async function downloadEmployeeTemplate() {
  const sample = ["EMP-006", "Rahul Kumar", "Mining", "Mining Mate", "Bolani", "rahul@example.com", "9876543210", "2026-08-27", DEFAULT_COURSE, "rahul006", DEFAULT_PASSWORD, "Active"];
  const XLSX = await loadXLSX();
  if (XLSX) {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, sample]), "Employees");
    XLSX.writeFile(wb, "MineMagma_Employee_Template.xlsx");
  } else {
    downloadCSV([TEMPLATE_HEADERS, sample], "MineMagma_Employee_Template.csv");
  }
}

export async function exportTrainingReport(employees) {
  const headers = ["Employee ID", "Name", "Department", "Designation", "Mine / Site", "Training Programme", "Training Progress (%)", "Assessment", "Practical", "OJT", "Certificate", "Status"];
  const rows = employees.map((e) => [
    e.id, e.name, e.department || "", e.designation || "", e.mine || "", e.course || "",
    progressOf(e), assessmentLabel(e), e.practical || "Pending", e.ojt || "Pending",
    e.certificate || "Pending", e.status || "Active",
  ]);
  const stamp = today();
  const XLSX = await loadXLSX();
  if (XLSX) {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...rows]), "Training Status");
    XLSX.writeFile(wb, `MineMagma_Training_Status_${stamp}.xlsx`);
  } else {
    downloadCSV([headers, ...rows], `MineMagma_Training_Status_${stamp}.csv`);
  }
}

export function normalizeEmployeeRow(r) {
  const g = (...keys) => {
    for (const k of keys) if (r[k] !== undefined && String(r[k]).trim()) return String(r[k]).trim();
    return "";
  };
  return {
    id: g("Employee ID", "EmployeeID", "ID"),
    name: g("Name", "Employee Name"),
    department: g("Department"),
    designation: g("Designation"),
    mine: g("Mine / Site", "Mine", "Site"),
    email: g("Email"),
    mobile: g("Mobile", "Mobile No"),
    joining: g("Joining Date"),
    course: g("Training Programme", "Assigned Course", "Course") || DEFAULT_COURSE,
    username: g("Username", "User Name"),
    password: g("Temporary Password", "Password") || DEFAULT_PASSWORD,
    status: g("Status") || "Active",
    progress: 0, score: null, practical: "Pending", ojt: "Pending", certificate: "Pending",
  };
}

// Reads a .csv / .xlsx / .xls file and returns normalized employee objects.
export async function readEmployeeFile(file) {
  let rows;
  if (/\.csv$/i.test(file.name)) {
    rows = parseCSV(await file.text());
  } else {
    const XLSX = await loadXLSX();
    if (!XLSX) throw new Error("Excel support is unavailable. Please use the CSV template.");
    const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: "array" });
    rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
  }
  return rows.map(normalizeEmployeeRow).filter((x) => x.id || x.name);
}
