import Pill from "../../components/common/Pill";
import StatCard from "../../components/common/StatCard";
import { PASS_MARK } from "../../constants/config";
import useCurrentEmployee from "../../hooks/useCurrentEmployee";
import { assessmentLabel, hasScore, isPassed, progressOf } from "../../utils/training";

export default function Dashboard() {
  const e = useCurrentEmployee();
  if (!e) return null;

  const p = progressOf(e);
  const trainingStatus = p >= 100 ? "Completed" : p > 0 ? "In Progress" : "Pending";

  const rows = [
    {
      icon: "📋",
      title: "Training Programme",
      meta: (
        <>
          {e.course || "—"} • {p}% complete
          <div className="progress"><span style={{ width: `${p}%` }} /></div>
        </>
      ),
      status: trainingStatus,
      done: p >= 100,
    },
    { icon: "🛠️", title: "Practical Training", meta: "Verified by the trainer / administrator", status: e.practical || "Pending", done: e.practical === "Completed" },
    { icon: "👷", title: "On-the-Job Training (OJT)", meta: "Verified by the supervisor / administrator", status: e.ojt || "Pending", done: e.ojt === "Completed" },
    { icon: "📝", title: "Online Assessment", meta: `Passing score: ${PASS_MARK}%`, status: assessmentLabel(e), done: isPassed(e) },
    { icon: "🎓", title: "Certificate", meta: "Issued after assessment, practical and OJT are complete", status: e.certificate || "Pending", done: e.certificate === "Issued" },
  ];

  return (
    <section>
      <div className="hero">
        <div>
          <h1>Training Tracking & Monitoring</h1>
          <p>Track your training progress, practical/OJT status, assessment result and certification.</p>
        </div>
        <div className="hero-badge">
          <div className="muted hero-badge-label">Training programme</div>
          <strong>{e.course || "—"}</strong>
        </div>
      </div>

      <div className="grid">
        <StatCard value={`${p}%`} label="Training Progress" />
        <StatCard value={hasScore(e) ? `${Number(e.score)}%` : "—"} label="Assessment Score" />
        <StatCard value={e.certificate === "Issued" ? "Issued" : "Pending"} label="Certification Status" />
      </div>

      <div className="card mt-22">
        <div className="section-title"><h2>My Training Tracker</h2></div>
        {rows.map((r) => (
          <div key={r.title} className={`tracker-row ${r.done ? "done" : ""}`}>
            <div className="tracker-ico">{r.done ? "✓" : r.icon}</div>
            <div>
              <div className="admin-row-title">{r.title}</div>
              <div className="admin-row-meta">{r.meta}</div>
            </div>
            <div><Pill text={r.status} /></div>
          </div>
        ))}
      </div>

      <div className="notice">
        <strong>Demo note:</strong> This prototype demonstrates the tracking workflow. Statutory training requirements,
        including physical/practical/OJT components where applicable, should be configured according to the approved
        training scheme. Training, practical and OJT status are updated by the Admin.
      </div>
    </section>
  );
}
