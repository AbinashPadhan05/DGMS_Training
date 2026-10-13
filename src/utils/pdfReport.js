import { assessmentLabel, progressOf, today, typeOf } from "./training";
import { getPassMark } from "./settings";

const HEAD = ["#", "Employee ID", "Name", "Type", "Department", "Designation", "Mine / Site", "Training Programme", "Progress", "Assessment", "Practical", "OJT", "Certificate", "Status"];

// Reports are downloaded only as PDF. jsPDF is loaded on demand so it stays out of the main bundle.
// options: { title, subtitle, fileName }
export async function downloadTrainingReportPDF(employees, options = {}) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableModule.default || autoTableModule.autoTable;

  const title = options.title || "Employee Training Status Report";
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const count = (fn) => employees.filter(fn).length;
  const summary = [
    `Total: ${employees.length}`,
    `Regular: ${count((e) => typeOf(e) === "Regular")}`,
    `Contractual: ${count((e) => typeOf(e) === "Contractual")}`,
    `Training completed: ${count((e) => progressOf(e) >= 100)}`,
    `Assessment passed (min ${getPassMark()}%): ${count((e) => assessmentLabel(e).startsWith("Passed"))}`,
    `Certificates issued: ${count((e) => e.certificate === "Issued")}`,
  ].join("   |   ");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MineMagma - Training Tracking & Monitoring", 40, 38);
  doc.setFontSize(13);
  doc.text(title, 40, 58);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(`Generated on ${today()}${options.subtitle ? `   |   ${options.subtitle}` : ""}`, 40, 73);
  doc.text(summary, 40, 86);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 98,
    head: [HEAD],
    body: employees.map((e, i) => [
      i + 1, e.id, e.name, typeOf(e), e.department || "", e.designation || "", e.mine || "", e.course || "",
      `${progressOf(e)}%`, assessmentLabel(e), e.practical || "Pending", e.ojt || "Pending",
      e.certificate || "Pending", e.status || "Active",
    ]),
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

  if (!employees.length) {
    doc.setFontSize(10);
    doc.text("No employees match the selected filters.", 40, 130);
  }

  doc.save(options.fileName || `MineMagma_Training_Report_${today()}.pdf`);
}
