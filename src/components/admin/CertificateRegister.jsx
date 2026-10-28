import { useState } from "react";
import { TRAINING_TYPES } from "../../constants/training";
import { useData } from "../../context/DataContext";
import { formatDate } from "../../utils/dates";
import { certificateRows, downloadCertificateRegisterPDF } from "../../utils/pdfReport";
import { categoryLabel } from "../../utils/trainingRecords";
import TypePill from "../common/TypePill";

export default function CertificateRegister() {
  const { employees } = useData();
  const [open, setOpen] = useState(false);
  const rows = certificateRows(employees);

  return (
    <div className="card mt-20">
      <div className="section-title">
        <div>
          <h3>🎓 Certificate Register</h3>
          <div className="muted">Every certificate issued, with its serial number. {rows.length} issued.</div>
        </div>
        <div className="row-gap wrap">
          <button className="btn secondary" onClick={() => setOpen((v) => !v)}>{open ? "Hide" : "Show"} register</button>
          <button className="btn secondary" onClick={() => downloadCertificateRegisterPDF(employees)}>⬇ Download PDF</button>
        </div>
      </div>
      {open && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Certificate No.</th><th>Employee</th><th>Type</th><th>Mine Category</th><th>Training</th><th>Score</th><th>Issued</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={7} className="empty-row">No certificates issued yet.</td></tr>}
              {rows.map(({ employee: e, training: t }) => (
                <tr key={`${e.id}-${t.id}`}>
                  <td><strong>{t.certNo}</strong></td>
                  <td>{e.name}<div className="admin-row-meta">{e.id}</div></td>
                  <td><TypePill employee={e} /></td>
                  <td>{categoryLabel(e)}</td>
                  <td>{TRAINING_TYPES.find((x) => x.key === t.type)?.short}</td>
                  <td>{t.score === null || t.score === undefined ? "—" : `${t.score}%`}</td>
                  <td>{formatDate(t.certDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
