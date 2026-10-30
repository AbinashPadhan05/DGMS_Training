import { TRAINING_TYPES } from "../constants/training";
import { formatDate, today } from "./dates";
import { getPassMark } from "./settings";
import { assessmentLabel, progressOf, typeOf } from "./training";
import { categoryLabel, refresherInfo, retentionInfo } from "./trainingRecords";

// Reports are downloaded only as PDF. jsPDF is loaded on demand so it stays out of the main bundle.
async function buildPDF({ title, subtitle, summary, head, body, fileName, emptyText, columnStyles }) {
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
    columnStyles,
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

/* ---------- Round 2: inspection, employee record, audit log, trainers ---------- */

const trainerName = (trainers, id) => trainers.find((t) => t.id === id)?.name || "";
const stamp = (iso) => (iso ? `${formatDate(iso.slice(0, 10))} ${iso.slice(11, 16)}` : "");
const attendanceCounts = (t) => {
  const c = { Present: 0, "Half day": 0, Absent: 0, Leave: 0 };
  (t.attendance || []).forEach((a) => { c[a.status] = (c[a.status] || 0) + 1; });
  return c;
};

// One row per training record of every employee (archived ones included, as records must be retained).
export function downloadInspectionPDF(employees, trainers) {
  const rows = [];
  employees.forEach((e) => (e.trainings || []).forEach((t) => rows.push({ e, t })));
  const withAtt = rows.filter(({ t }) => (t.attendance || []).length).length;
  const withLog = rows.filter(({ t }) => (t.sessions || []).length).length;
  const withDoc = rows.filter(({ t }) => (t.documents || []).length).length;
  return buildPDF({
    title: "Training Records - Inspection Report",
    subtitle: "DGMS (Legislative) Circular No. 01 of 2026 - records of assessments, attendance, training logs, certificates and trainers",
    summary: `Training records: ${rows.length}   |   With attendance: ${withAtt}   |   With training log: ${withLog}   |   With documents: ${withDoc}   |   Archived employees: ${employees.filter((e) => e.archived).length}`,
    fileName: `MineMagma_Inspection_Report_${today()}.pdf`,
    head: ["Employee", "Type / Category", "Training", "Started", "Days", "Attendance", "Log", "Trainers", "Assessment", "Practical / OJT", "Certificate", "Docs", "Retention"],
    body: rows.map(({ e, t }) => {
      const c = attendanceCounts(t);
      const names = [...new Set((t.sessions || []).map((x) => trainerName(trainers, x.trainerId)).filter(Boolean))].join(", ");
      return [
        `${e.id}\n${e.name}${e.archived ? " (archived)" : ""}`, `${typeOf(e)}\n${categoryLabel(e)}`, typeShort(t.type), formatDate(t.startDate),
        `${t.daysCompleted ?? "-"}/${t.requiredDays ?? "-"}`, (t.attendance || []).length ? `P ${c.Present}, H ${c["Half day"]}, A ${c.Absent}, L ${c.Leave}` : "-",
        (t.sessions || []).length ? `${t.sessions.length} sessions` : "-", names || "-",
        t.score === null || t.score === undefined ? "Not attempted" : `${t.score}% (${t.evalStatus}); ${(t.attempts || []).length} attempt(s)`,
        `${t.practical} / ${t.ojt}`, t.certificate === "Issued" ? `${t.certNo}\n${formatDate(t.certDate)}` : "Pending",
        (t.documents || []).length || "-", retentionInfo(e).archived ? retentionInfo(e).label : "Service + 5 yrs",
      ];
    }),
  });
}

export function downloadAuditLogPDF(entries, options = {}) {
  return buildPDF({
    title: "Audit Log - Record Changes",
    subtitle: options.subtitle,
    summary: `Entries: ${entries.length}`,
    fileName: `MineMagma_Audit_Log_${today()}.pdf`,
    head: ["Date / time", "User", "Role", "Action", "Record", "Details"],
    body: entries.map((a) => [stamp(a.at), a.by, a.role, a.action, a.target, a.detail]),
    columnStyles: { 5: { cellWidth: 230 } },
  });
}

export function downloadTrainersPDF(trainers, employees) {
  const count = (id) => employees.reduce((n, e) => n + (e.trainings || []).reduce((m, t) => m + (t.sessions || []).filter((s) => s.trainerId === id).length, 0), 0);
  return buildPDF({
    title: "Training Officer, Instructors and Trainers Register",
    summary: `Trainers: ${trainers.length}`,
    fileName: `MineMagma_Trainers_Register_${today()}.pdf`,
    head: ["ID", "Name", "Designation", "Role", "Appointed", "Status", "Sessions logged"],
    body: trainers.map((t) => [t.id, t.name, t.designation || "", t.role, formatDate(t.appointmentDate), t.status || "Active", count(t.id)]),
  });
}

// Complete record of one employee: profile, every training, attendance, log, documents.
export async function downloadEmployeeRecordPDF(e, trainers) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableModule.default || autoTableModule.autoTable;
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageH = doc.internal.pageSize.getHeight();
  const left = 40;
  const green = [15, 81, 50];
  const r = refresherInfo(e);
  const ret = retentionInfo(e);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("MineMagma - Employee Training Record", left, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(`Generated on ${today()}   |   Based on DGMS (Legislative) Circular No. 01 of 2026`, left, 55);
  doc.setTextColor(0);

  const common = { margin: { left, right: left, bottom: 40 }, styles: { fontSize: 8, cellPadding: 3 }, headStyles: { fillColor: green, textColor: 255 } };
  const kv = (rows, startY) => autoTable(doc, { ...common, startY, body: rows, theme: "grid", columnStyles: { 0: { fontStyle: "bold", cellWidth: 130, fillColor: [244, 247, 246] } } });
  const heading = (text) => {
    let y = doc.lastAutoTable.finalY + 18;
    if (y > pageH - 90) { doc.addPage(); y = 50; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(text, left, y);
    doc.setFont("helvetica", "normal");
    return y + 6;
  };

  kv([
    ["Employee", `${e.name} (${e.id})`], ["Employee type", `${typeOf(e)}${e.contractor ? ` - ${e.contractor}` : ""}`],
    ["Department / Designation", `${e.department || "-"} / ${e.designation || "-"}`], ["Grade", `${e.grade || "Worker"}${e.highlySkilled ? " (highly skilled)" : ""}`],
    ["Mine / Site", e.mine || "-"], ["Mine category", categoryLabel(e)], ["Joining date", formatDate(e.joining)], ["Status", e.archived ? `Archived - left ${formatDate(e.archived.leavingDate)}${e.archived.reason ? ` (${e.archived.reason})` : ""}` : e.status || "Active"],
    ["Record retention", ret.label], ["Refresher", r.status === "none" ? "Initial training not yet certified" : `${formatDate(r.due)} (${r.status === "ok" ? "up to date" : r.label})`],
  ], 66);

  (e.trainings || []).forEach((t, i) => {
    const c = attendanceCounts(t);
    const y = heading(`${i + 1}. ${typeShort(t.type)} training${t.startDate ? ` - started ${formatDate(t.startDate)}` : ""}`);
    kv([
      ["Days completed / required", `${t.daysCompleted ?? "-"} / ${t.requiredDays ?? "-"} (${t.progress}%)${t.daysFromRegister ? " - from attendance register" : ""}`],
      ["Practical / OJT / Field test", `${t.practical} / ${t.ojt} / ${t.fieldTest}`],
      ["Assessment", t.score === null || t.score === undefined ? "Not attempted" : `${t.score}% on ${formatDate(t.assessmentDate)} - ${t.evalStatus}`],
      ["Assessment attempts", (t.attempts || []).map((a, n) => `#${n + 1}: ${a.score}%${a.date ? ` (${formatDate(a.date)})` : ""}`).join("; ") || "-"],
      ["Additional training days", String(t.additionalDays || 0)],
      ["Certificate", t.certificate === "Issued" ? `${t.certNo} - issued ${formatDate(t.certDate)}` : "Pending"],
      ["Attendance", (t.attendance || []).length ? `Present ${c.Present}, Half day ${c["Half day"]}, Absent ${c.Absent}, Leave ${c.Leave}` : "Not recorded"],
      ["Notes", t.notes || "-"],
    ], y);
    if ((t.sessions || []).length) {
      autoTable(doc, { ...common, startY: doc.lastAutoTable.finalY + 6, head: [["Date", "Module", "Topic", "Trainer", "Hours"]],
        body: t.sessions.map((s) => [formatDate(s.date), s.part, s.topic || "-", trainerName(trainers, s.trainerId) || "-", s.hours === "" || s.hours === undefined ? "-" : s.hours]) });
    }
    if ((t.attendance || []).length) {
      autoTable(doc, { ...common, startY: doc.lastAutoTable.finalY + 6, head: [["Attendance date", "Status", "Remark"]], body: t.attendance.map((a) => [formatDate(a.date), a.status, a.note || ""]) });
    }
    if ((t.documents || []).length) {
      autoTable(doc, { ...common, startY: doc.lastAutoTable.finalY + 6, head: [["Document", "Type", "Added"]], body: t.documents.map((d) => [d.name, d.type, formatDate(d.addedOn)]) });
    }
  });

  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`${e.id} - ${e.name}   |   Page ${p} of ${pages}`, doc.internal.pageSize.getWidth() - left, pageH - 16, { align: "right" });
  }
  doc.save(`MineMagma_Record_${String(e.id).replace(/[^A-Za-z0-9-]/g, "")}_${today()}.pdf`);
}
