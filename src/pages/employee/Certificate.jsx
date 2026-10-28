import { useState } from "react";
import Pill from "../../components/common/Pill";
import { TRAINING_TYPES } from "../../constants/training";
import useCurrentEmployee from "../../hooks/useCurrentEmployee";
import { formatDate } from "../../utils/dates";
import { getPassMark } from "../../utils/settings";
import { assessmentLabel, isPassed } from "../../utils/training";
import { activeTraining, categoryLabel } from "../../utils/trainingRecords";

function Requirement({ done, label, status }) {
  return (
    <div className="admin-row">
      <div>{done ? "✅" : "⏳"} {label}</div>
      <Pill text={status} />
    </div>
  );
}

const typeLabel = (key) => TRAINING_TYPES.find((t) => t.key === key)?.short || key;

export default function Certificate() {
  const e = useCurrentEmployee();
  const [pickedId, setPickedId] = useState(null);
  if (!e) return null;

  const issuedList = e.trainings.filter((t) => t.certificate === "Issued");
  const active = activeTraining(e);
  // Show the picked certificate, otherwise the active training's, otherwise the latest issued one.
  const shown = e.trainings.find((t) => t.id === pickedId) || (active.certificate === "Issued" ? active : issuedList[issuedList.length - 1] || active);
  const issued = shown.certificate === "Issued";
  const isActive = shown.id === active.id;

  return (
    <section>
      <div className="section-title">
        <h2>Digital Certificate</h2>
        {issued && <button className="btn" onClick={() => window.print()}>Print / Save PDF</button>}
      </div>

      {issuedList.length > 1 && (
        <div className="segmented mb-16">
          {issuedList.map((t) => (
            <button key={t.id} className={shown.id === t.id ? "active" : ""} onClick={() => setPickedId(t.id)}>
              {typeLabel(t.type)} – {formatDate(t.certDate)}
            </button>
          ))}
        </div>
      )}

      {!issued ? (
        <div className="card">
          <h3>Certificate not available yet</h3>
          <p className="muted">The certificate for your current {typeLabel(shown.type)} training is issued automatically when all requirements below are complete.</p>
          <Requirement done={shown.progress >= 100} label={`Training days completed${shown.requiredDays ? ` (minimum ${shown.requiredDays} days)` : ""}`} status={shown.progress >= 100 ? "Completed" : `${shown.daysCompleted ?? 0} / ${shown.requiredDays ?? "—"} days`} />
          <Requirement done={isActive ? isPassed(e) : shown.score >= getPassMark()} label={`Assessment passed (min ${getPassMark()}%)`} status={isActive ? assessmentLabel(e) : shown.evalStatus} />
          <Requirement done={shown.practical === "Completed"} label="Practical verified" status={shown.practical || "Pending"} />
          <Requirement done={shown.ojt === "Completed"} label="OJT verified" status={shown.ojt || "Pending"} />
          {e.highlySkilled && <Requirement done={shown.fieldTest === "Passed"} label="Practical field test" status={shown.fieldTest} />}
        </div>
      ) : (
        <div className="certificate">
          <div className="seal">MM</div>
          <small>MINEMAGMA • TRAINING TRACKING & MONITORING</small>
          <h1>Certificate of Training</h1>
          <p>This is to certify that</p>
          <div className="name">{e.name}</div>
          <p>({e.grade || "Worker"}, {categoryLabel(e)}) has completed the <strong>{typeLabel(shown.type)}</strong> training, practical/OJT verification and assessment for</p>
          <h2 className="certificate-course">{e.course || "Training Programme"}</h2>
          <p>
            Training period: <strong>{formatDate(shown.startDate)}</strong> to <strong>{formatDate(shown.completionDate || shown.certDate)}</strong>
            {shown.requiredDays ? <> ({shown.daysCompleted ?? shown.requiredDays} of minimum {shown.requiredDays} days)</> : null}
          </p>
          <p>Assessment Score: <strong>{shown.score}%</strong>{shown.assessmentDate ? <> on {formatDate(shown.assessmentDate)}</> : null}</p>
          <p>Certificate No.: <strong>{shown.certNo}</strong></p>
          <div className="certificate-footer">
            <div><small>Date of issue</small><br /><strong>{formatDate(shown.certDate)}</strong></div>
            <div><small>Employee ID</small><br /><strong>{e.id}</strong></div>
            <div><small>Verification</small><br /><strong>Digital Record</strong></div>
          </div>
          <div className="notice">
            Demo certificate. For statutory use, configure the approved training scheme, authorized trainer details and
            certificate rules before deployment.
          </div>
        </div>
      )}
    </section>
  );
}
