import CertificateRegister from "../../components/admin/CertificateRegister";
import EmployeeManagement from "../../components/admin/EmployeeManagement";
import TrainingStatusCard from "../../components/admin/TrainingStatusCard";

export default function EmployeesPage() {
  return (
    <section>
      <div className="section-title">
        <div>
          <h2>Employees</h2>
          <div className="muted">Add, import, edit profile / login, update training records, activate, deactivate or delete. Regular and contractual employees are separated by tabs.</div>
        </div>
      </div>
      <EmployeeManagement />
      <TrainingStatusCard canDelete canEditProfile />
      <CertificateRegister />
    </section>
  );
}
