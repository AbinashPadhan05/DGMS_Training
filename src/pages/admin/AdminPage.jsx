import AdminStats from "../../components/admin/AdminStats";
import EmployeeManagement from "../../components/admin/EmployeeManagement";
import QuestionForm from "../../components/admin/QuestionForm";
import QuestionList from "../../components/admin/QuestionList";
import TrainingStatusCard from "../../components/admin/TrainingStatusCard";
import { useData } from "../../context/DataContext";

export default function AdminPage() {
  const { employees, resetQuestions } = useData();

  const handleReset = () => {
    if (!window.confirm("Reset the question bank to the original sample questions?")) return;
    resetQuestions();
    alert("Question bank reset.");
  };

  return (
    <section>
      <div className="section-title">
        <div>
          <h2>Admin Dashboard</h2>
          <div className="muted">Monitor employee training progress, practical/OJT, assessments and certification status.</div>
        </div>
        <span className="pill">Admin Only</span>
      </div>

      <AdminStats employees={employees} />
      <TrainingStatusCard />
      <EmployeeManagement />
      <QuestionForm />
      <QuestionList />

      <div className="card mt-18">
        <h3>Admin Utilities</h3>
        <p className="muted">Reset the assessment question bank back to the original sample questions.</p>
        <button className="btn danger" onClick={handleReset}>Reset Question Bank</button>
      </div>
    </section>
  );
}
