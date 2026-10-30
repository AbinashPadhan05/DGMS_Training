import AdminStats from "../../components/admin/AdminStats";
import { useData } from "../../context/DataContext";

export default function OverviewPage({ onNavigate }) {
  const { employees, managers, circulars, questions, trainers } = useData();
  const links = [
    ["employees", "👥 Employees", `${employees.length} records`],
    ["managers", "🧑‍💼 Managers", `${managers.length} accounts`],
    ["trainers", "🧑‍🏫 Trainers", `${trainers.length} registered`],
    ["circulars", "📚 Circulars & Syllabus", `${circulars.length} circulars`],
    ["questions", "❓ Question Bank", `${questions.length} questions`],
  ];
  return (
    <section>
      <div className="section-title">
        <div>
          <h2>Administrator Overview</h2>
          <div className="muted">Full control over employees, managers, syllabus, assessments, reports and settings.</div>
        </div>
        <span className="pill">Admin Only</span>
      </div>
      <AdminStats employees={employees} />
      <div className="grid four">
        {links.map(([page, title, meta]) => (
          <button key={page} className="card quick-link" onClick={() => onNavigate(page)}>
            <div className="admin-row-title">{title}</div>
            <div className="admin-row-meta">{meta}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
