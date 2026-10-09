import StatCard from "../common/StatCard";
import { computeStats } from "../../utils/training";

export default function AdminStats({ employees }) {
  const s = computeStats(employees);
  return (
    <>
      <div className="grid four mt-0">
        <StatCard value={s.total} label="Total Employees" />
        <StatCard value={s.completed} label="Training Completed" />
        <StatCard value={s.passed} label="Assessment Passed" />
        <StatCard value={s.certificates} label="Certificates Issued" />
      </div>
      <div className="grid four">
        <StatCard value={s.inProgress} label="Training In Progress" />
        <StatCard value={s.practical} label="Practical Completed" />
        <StatCard value={s.ojt} label="OJT Completed" />
        <StatCard value={s.certPending} label="Certification Pending" />
      </div>
    </>
  );
}
