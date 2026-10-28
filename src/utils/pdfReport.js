import { TRAINING_TYPES } from "../constants/training";
import { formatDate, today } from "./dates";
import { getPassMark } from "./settings";
import { assessmentLabel, progressOf, typeOf } from "./training";
import { categoryLabel, refresherInfo } from "./trainingRecords";

// Reports are downloaded only as PDF. jsPDF is loaded on demand so it stays out of the main bundle.
async function buildPDF({ title, subtitle, summary, head, body, fileName, emptyText }) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableModule.default || autoTableModule.autoTable;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MineMagma - Training Tracking & Monitoring", 40, 38);
  doc.setFontSize(13);
  doc.text(title, 40, 58);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(`Generated on ${today()}${subtitle ? `   |   ${subtitle}` : ""}`, 40, 73);
  if (summary) doc.text(summary, 40, 86);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 98,
    head: [head],
    body,
    styles: { fontSize: 7.5, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: [15, 81, 50], textColor: 255 },
    alternateRowStyles: { fillColor: [244, 247, 246] },
    margin: { left: 40, right: 40, bottom: 30 },
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageW - 40, pageH - 14, { align: "right" });
      doc.setTextColor(0);
    },
  });

  if (!body.length) {
    doc.setFontSize(10);
    doc.text(emptyText || "No records match the selected filters.", 40, 130);
  }
  doc.save(fileName);
}

const typeShort = (key) => TRAINING_TYPES.find((t) => t.key === key)?.short || key || "";

// options: { title, subtitle, fileName }
export function downloadTrainingReportPDF(employees, options = {}) {
  const count = (fn) => employees.filter(fn).length;
  const summary = [
    `Total: ${employees.length}`,
    `Regular: ${count((e) => typeOf(e) === "Regular")}`,
    `Contractual: ${count((e) => typeOf(e) === "Contractual")}`,
    `Training completed: ${count((e) => progressOf(e) >= 100)}`,
    `Assessment passed (min ${getPassMark()}%): ${count((e) => assessmentLabel(e).startsWith("Passed"))}`,
    `Certificates issued: ${count((e) => e.certificate === "Issued")}`,
    `Refresher overdue: ${count((e) => refresherInfo(e).status === "overdue")}`,
  ].join("   |   ");

  return buildPDF({
    title: options.title || "Employee Training Status Report",
    subtitle: options.subtitle,
    summary,
    fileName: options.fileName || `MineMagma_Training_Report_${today()}.pdf`,
    head: ["#", "Employee ID", "Name", "Type", "Mine Category", "Training", "Days", "Progress", "Assessment", "Practical", "OJT", "Field Test", "Certificate", "Refresher Due", "Status"],
    body: employees.map((e, i) => {
      const r = refresherInfo(e);
      return [
        i + 1, e.id, e.name, typeOf(e), categoryLabel(e), typeShort(e.trainingType),
        `${e.daysCompleted ?? "-"}/${e.requiredDays ?? "-"}`, `${progressOf(e)}%`,
        e.evalStatus && e.evalStatus !== "Passed" && e.evalStatus !== "Not attempted" ? `${assessmentLabel(e)} - ${e.evalStatus}` : assessmentLabel(e),
        e.practical || "Pending", e.ojt || "Pending", e.fieldTest || "-", e.certificate || "Pending",
        r.status === "none" ? "-" : `${formatDate(r.due)} (${r.status === "ok" ? "OK" : r.label})`, e.status || "Active",
      ];
    }),
  });
}

// Every issued certificate, newest first.
export function certificateRows(employees) {
  const rows = [];
  employees.forEach((e) => (e.trainings || []).forEach((t) => {
    if (t.certificate === "Issued") rows.push({ employee: e, training: t });
  }));
  return rows.sort((a, b) => (a.training.certDate < b.training.certDate ? 1 : -1));
}

export function downloadCertificateRegisterPDF(employees, options = {}) {
  const rows = certificateRows(employees);
  return buildPDF({
    title: "Certificate Register",
    subtitle: options.subtitle,
    summary: `Certificates issued: ${rows.length}`,
    fileName: options.fileName || `MineMagma_Certificate_Register_${today()}.pdf`,
    emptyText: "No certificates have been issued yet.",
    head: ["#", "Certificate No.", "Employee ID", "Name", "Type", "Mine Category", "Training", "Programme", "Score", "Issue Date"],
    body: rows.map(({ employee: e, training: t }, i) => [
      i + 1, t.certNo, e.id, e.name, typeOf(e), categoryLabel(e), typeShort(t.type), e.course || "",
      t.score === null || t.score === undefined ? "-" : `${t.score}%`, formatDate(t.certDate),
    ]),
  });
}
