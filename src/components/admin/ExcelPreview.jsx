import { CATEGORIES } from "../../constants/training";
import { isDuplicate } from "../../utils/training";

const COLUMNS = [
  { key: "id", label: "Employee ID" },
  { key: "name", label: "Name" },
  { key: "department", label: "Department" },
  { key: "designation", label: "Designation" },
  { key: "type", label: "Type" },
  { key: "category", label: "Mine Category", render: (e) => CATEGORIES.find((c) => c.key === e.category)?.label },
  { key: "grade", label: "Grade" },
  { key: "mine", label: "Mine / Site" },
  { key: "course", label: "Training Programme" },
  { key: "username", label: "Username" },
  { key: "status", label: "Status" },
];

export default function ExcelPreview({ rows, existing, onConfirm, onCancel }) {
  // Rows earlier in the same file also count as "existing" for duplicate checks.
  const seen = [...existing];
  const validated = rows.map((e) => {
    const duplicate = isDuplicate(seen, e.id, e.username);
    const missing = !e.id || !e.name || !e.username;
    if (!duplicate && !missing) seen.push(e);
    return { e, label: duplicate ? "Duplicate" : missing ? "Missing required field" : "Ready" };
  });

  return (
    <div className="excel-preview">
      <div className="notice"><strong>Excel Preview:</strong> Review the rows before importing.</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {COLUMNS.map((c) => <th key={c.key}>{c.label}</th>)}
              <th>Validation</th>
            </tr>
          </thead>
          <tbody>
            {validated.map(({ e, label }, i) => (
              <tr key={i}>
                {COLUMNS.map((c) => <td key={c.key}>{(c.render ? c.render(e) : e[c.key]) || "—"}</td>)}
                <td>{label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row-gap mt-12">
        <button className="btn" onClick={onConfirm}>✓ Import Valid Employees</button>
        <button className="btn secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
