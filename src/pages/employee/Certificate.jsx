import Pill from "../../components/common/Pill";
import { PASS_MARK } from "../../constants/config";
import useCurrentEmployee from "../../hooks/useCurrentEmployee";
import { assessmentLabel, isPassed, progressOf } from "../../utils/training";

function Requirement({ done, label, status }) {
  return (
    <div className="admin-row">
      <div>{done ? "✅" : "⏳"} {label}</div>
      <Pill text={status} />
    </div>
  );
}

export default function Certificate() {
  const e = useCurrentEmployee();
  if (!e) return null;

  const issued = e.certificate === "Issued";
  const date = e.certDate ? new Date(e.certDate) : new Date();
  const certNo = `MM-${date.getFullYear()}-${String(e.id).replace(/[^A-Za-z0-9]/g, "")}`;

  return (
    <section>
      <div className="section-title">
        <h2>Digital Certificate</h2>
        {issued && <button className="btn" onClick={() => window.print()}>Print / Save PDF</button>}
      </div>

      {!issued ? (
        <div className="card">
          <h3>Certificate not available yet</h3>
          <p className="muted">The certificate is issued automatically when all requirements below are complete.</p>
          <Requirement done={progressOf(e) >= 100} label="Training completed" status={progressOf(e) >= 100 ? "Completed" : "Pending"} />
          <Requirement done={isPassed(e)} label={`Assessment passed (min ${PASS_MARK}%)`} status={assessmentLabel(e)} />
          <Requirement done={e.practical === "Completed"} label="Practical verified" status={e.practical || "Pending"} />
          <Requirement done={e.ojt === "Completed"} label="OJT verified" status={e.ojt || "Pending"} />
        </div>
      ) : (
        <div className="certificate">
          <div className="seal">MM</div>
          <small>MINEMAGMA • TRAINING TRACKING & MONITORING</small>
          <h1>Certificate of Training</h1>
          <p>This is to certify that</p>
          <div className="name">{e.name}</div>
          <p>has successfully completed the training, practical/OJT verification and digital assessment for</p>
          <h2 className="certificate-course">{e.course || "Training Programme"}</h2>
          <p>Assessment Score: <strong>{Number(e.score)}%</strong></p>
          <p>Certificate No.: <strong>{certNo}</strong></p>
          <div className="certificate-footer">
            <div><small>Date</small><br /><strong>{date.toLocaleDateString("en-IN")}</strong></div>
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
