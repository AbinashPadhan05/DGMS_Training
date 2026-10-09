const EMPLOYEE_NAV = [
  { page: "dashboard", icon: "🏠", label: "My Training Status" },
  { page: "exam", icon: "📝", label: "Assessment" },
  { page: "certificate", icon: "🎓", label: "Certificate" },
];
const ADMIN_NAV = [{ page: "admin", icon: "⚙️", label: "Admin Panel" }];

export default function Sidebar({ role, page, onNavigate }) {
  const items = role === "admin" ? ADMIN_NAV : EMPLOYEE_NAV;
  return (
    <aside>
      <h3>Platform</h3>
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
