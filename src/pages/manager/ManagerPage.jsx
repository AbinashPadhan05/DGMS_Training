import AdminStats from "../../components/admin/AdminStats";
import CertificateRegister from "../../components/admin/CertificateRegister";
import EmployeeManagement from "../../components/admin/EmployeeManagement";
import TrainingStatusCard from "../../components/admin/TrainingStatusCard";
import { useData } from "../../context/DataContext";

export default function ManagerPage() {
  const { employees } = useData();

  return (
    <section>
      <div className="section-title">
        <div>
          <h2>Manager Dashboard</h2>
          <div className="muted">Monitor employee training progress, practical/OJT, assessments and certification status.</div>
        </div>
        <span className="pill">Manager</span>
      </div>

      <AdminStats employees={employees} />
      <TrainingStatusCard />
      <CertificateRegister />
      <EmployeeManagement />
    </section>
  );
}
