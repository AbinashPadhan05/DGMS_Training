import { useMemo, useState } from "react";
import { EMPLOYEE_FILTERS } from "../../constants/config";
import { useData } from "../../context/DataContext";
import { downloadTrainingReportPDF } from "../../utils/pdfReport";
import { filterEmployees, today } from "../../utils/training";

const REPORTS = {
  status: { label: "Training Status Report", filter: null },
  certificates: { label: "Certificates Issued", filter: "certificate" },
  pendingAssessment: { label: "Assessment Pending / Failed", filter: "pending" },
  pendingPractical: { label: "Practical Pending", filter: "practical" },
  pendingOjt: { label: "OJT Pending", filter: "ojt" },
};

export default function ReportsPage() {
  const { employees } = useData();
  const [report, setReport] = useState("status");
  const [type, setType] = useState("all");
  const [course, setCourse] = useState("all");
  const [status, setStatus] = useState("all");
  const [busy, setBusy] = useState(false);

  const courses = useMemo(() => [...new Set(employees.map((e) => e.course).filter(Boolean))], [employees]);

  const rows = useMemo(() => {
    const filter = REPORTS[report].filter || status;
    return filterEmployees(employees, "", filter, type).filter((e) => course === "all" || e.course === course);
  }, [employees, report, status, type, course]);

  const download = async () => {
    setBusy(true);
    try {
      const filterLabel = EMPLOYEE_FILTERS.find((f) => f.value === (REPORTS[report].filter || status))?.label;
      await downloadTrainingReportPDF(rows, {
        title: REPORTS[report].label,
        subtitle: [type === "all" ? "All employee types" : `${type} employees`, course === "all" ? "All courses" : course, filterLabel !== "All Status" && filterLabel].filter(Boolean).join(" | "),
        fileName: `MineMagma_${report}_${type}_${today()}.pdf`,
      });
    } catch (err) {
      console.error(err);
      alert("Could not create the PDF report.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="section-title">
        <div>
          <h2>Reports</h2>
          <div className="muted">Reports are downloaded in PDF format only.</div>
        </div>
      </div>

      <div className="card">
        <div className="grid cols-4 mt-0">
          <div>
            <label className="muted" htmlFor="rp-report">Report</label>
            <select id="rp-report" className="admin-input" value={report} onChange={(e) => setReport(e.target.value)}>
              {Object.entries(REPORTS).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="muted" htmlFor="rp-type">Employee type</label>
            <select id="rp-type" className="admin-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All (Regular + Contractual)</option>
              <option value="Regular">Regular only</option>
              <option value="Contractual">Contractual only</option>
            </select>
          </div>
          <div>
            <label className="muted" htmlFor="rp-course">Course</label>
            <select id="rp-course" className="admin-input" value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="all">All courses</option>
              {courses.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="muted" htmlFor="rp-status">Status</label>
            <select id="rp-status" className="admin-input" value={REPORTS[report].filter || status} disabled={!!REPORTS[report].filter} onChange={(e) => setStatus(e.target.value)}>
              {EMPLOYEE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>
        <div className="row-gap mt-15">
          <button className="btn" onClick={download} disabled={busy}>{busy ? "Preparing…" : "⬇ Download PDF"}</button>
          <span className="muted pad-top">{rows.length} employee(s) in this report</span>
        </div>
      </div>
    </section>
  );
}
