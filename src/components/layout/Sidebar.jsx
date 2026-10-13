export const EMPLOYEE_NAV = [
  { page: "dashboard", icon: "🏠", label: "My Training Status" },
  { page: "syllabus", icon: "📚", label: "Syllabus & Circulars" },
  { page: "exam", icon: "📝", label: "Assessment" },
  { page: "certificate", icon: "🎓", label: "Certificate" },
];
export const MANAGER_NAV = [
  { page: "manager", icon: "📋", label: "Training Monitor" },
  { page: "syllabus", icon: "📚", label: "Syllabus & Circulars" },
];
export const ADMIN_NAV = [
  { page: "overview", icon: "📊", label: "Overview" },
  { page: "employees", icon: "👥", label: "Employees" },
  { page: "managers", icon: "🧑‍💼", label: "Managers" },
  { page: "circulars", icon: "📚", label: "Circulars & Syllabus" },
  { page: "questions", icon: "❓", label: "Question Bank" },
  { page: "reports", icon: "📄", label: "Reports (PDF)" },
  { page: "settings", icon: "⚙️", label: "Settings" },
];

export default function Sidebar({ items, page, onNavigate, title = "Platform" }) {
  return (
    <aside>
      <h3>{title}</h3>
      {items.map((item) => (
        <button
          key={item.page}
          className={`nav ${page === item.page ? "active" : ""}`}
          onClick={() => onNavigate(item.page)}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </aside>
  );
}
