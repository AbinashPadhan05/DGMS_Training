import { useData } from "../../context/DataContext";
import { downloadInspectionPDF } from "../../utils/pdfReport";

export default function InspectionCard() {
  const { employees, trainers } = useData();
  return (
    <div className="card mt-20">
      <div className="section-title">
        <div>
          <h3>🔍 Inspection Report</h3>
          <div className="muted">
            One PDF with every training record: attendance, training log, trainers, assessment attempts, certificate numbers and retention.
            Includes archived employees.
          </div>
        </div>
        <button className="btn secondary" onClick={() => downloadInspectionPDF(employees, trainers)}>⬇ Download Inspection Report (PDF)</button>
      </div>
    </div>
  );
}
