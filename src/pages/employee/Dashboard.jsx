import Pill from "../../components/common/Pill";
import StatCard from "../../components/common/StatCard";
import { getPassMark } from "../../utils/settings";
import useCurrentEmployee from "../../hooks/useCurrentEmployee";
import { TRAINING_TYPES } from "../../constants/training";
import { formatDate } from "../../utils/dates";
import { assessmentLabel, hasScore, isPassed, progressOf, typeOf } from "../../utils/training";
import { categoryLabel, refresherInfo } from "../../utils/trainingRecords";

export default function Dashboard() {
  const e = useCurrentEmployee();
  if (!e) return null;

  const p = progressOf(e);
  const trainingStatus = p >= 100 ? "Completed" : p > 0 ? "In Progress" : "Pending";

  const typeLabel = TRAINING_TYPES.find((t) => t.key === e.trainingType)?.short || "—";
  const refresher = refresherInfo(e);

  const rows = [
    {
      icon: "📋",
      title: "Training Programme",
      meta: (
        <>
          {e.course || "—"} • {typeLabel} training • {e.daysCompleted ?? "—"} of {e.requiredDays ?? "—"} days • {p}% complete
          <div className="progress"><span style={{ width: `${p}%` }} /></div>
        </>
      ),
      status: trainingStatus,
      done: p >= 100,
    },
    { icon: "🛠️", title: "Practical Training", meta: "Verified by the trainer / administrator", status: e.practical || "Pending", done: e.practical === "Completed" },
    { icon: "👷", title: "On-the-Job Training (OJT)", meta: "Verified by the supervisor / administrator", status: e.ojt || "Pending", done: e.ojt === "Completed" },
    { icon: "📝", title: "Online Assessment", meta: `Passing score: ${getPassMark()}%`, status: assessmentLabel(e), done: isPassed(e) },
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
          <div className="muted hero-badge-label">{typeOf(e)} employee</div>
        </div>
      </div>

      <div className="grid">
        <StatCard value={`${p}%`} label="Training Progress" />
        <StatCard value={hasScore(e) ? `${Number(e.score)}%` : "—"} label="Assessment Score" />
        <StatCard value={e.certificate === "Issued" ? "Issued" : "Pending"} label="Certification Status" />
      </div>

      <div className="grid">
        <StatCard value={typeLabel} label="Current Training" />
        <StatCard value={`${e.daysCompleted ?? "—"} / ${e.requiredDays ?? "—"}`} label="Days Completed / Required" />
        <StatCard value={refresher.status === "none" ? "—" : formatDate(refresher.due)} label={refresher.status === "none" ? "Refresher (after initial training)" : `Next Refresher – ${refresher.label}`} />
      </div>

      {!e.category && <div className="alert warn">Your mine category is not set yet. Ask your manager to set it so the required training days can be shown.</div>}
      {e.evalStatus === "Additional training required" && (
        <div className="alert warn">Your score was below the pass mark. Additional training is required before re-evaluation. Your manager will update your record once it is done.</div>
      )}
      {e.evalStatus === "Re-evaluation due" && <div className="alert warn">Additional training is complete. You are due for re-evaluation.</div>}
      {refresher.status === "overdue" && <div className="alert bad">Your refresher training is overdue ({refresher.label.toLowerCase()}). Please contact your manager.</div>}
      {refresher.status === "soon" && <div className="alert warn">Your refresher training is {refresher.label.toLowerCase()}.</div>}

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

      <div className="card mt-22">
        <div className="section-title"><h2>My Training History</h2><span className="muted">{categoryLabel(e)} • {e.grade || "Worker"}</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Training</th><th>Started</th><th>Days</th><th>Progress</th><th>Assessment</th><th>Certificate</th></tr></thead>
            <tbody>
              {[...e.trainings].reverse().map((t) => (
                <tr key={t.id}>
                  <td><strong>{TRAINING_TYPES.find((x) => x.key === t.type)?.short}</strong></td>
                  <td>{formatDate(t.startDate)}</td>
                  <td>{t.daysCompleted ?? "—"} / {t.requiredDays ?? "—"}</td>
                  <td>{t.progress}%</td>
                  <td>{t.score === null || t.score === undefined ? "Not attempted" : `${t.score}% – ${t.evalStatus}`}</td>
                  <td><Pill text={t.certificate} />{t.certNo && <div className="admin-row-meta">{t.certNo}</div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="notice">
        <strong>Demo note:</strong> This prototype demonstrates the tracking workflow. Statutory training requirements,
        including physical/practical/OJT components where applicable, should be configured according to the approved
        training scheme. Training, practical and OJT status are updated by the Admin.
      </div>
    </section>
  );
}
