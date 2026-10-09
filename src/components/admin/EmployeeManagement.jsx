import { useState } from "react";
import { useData } from "../../context/DataContext";
import { downloadEmployeeTemplate, readEmployeeFile } from "../../utils/excel";
import EmployeeForm from "./EmployeeForm";
import ExcelPreview from "./ExcelPreview";

export default function EmployeeManagement() {
  const { employees, addEmployees } = useData();
  const [showForm, setShowForm] = useState(false);
  const [pending, setPending] = useState([]);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const rows = await readEmployeeFile(file);
      if (!rows.length) { alert("No employee records found."); return; }
      setPending(rows);
    } catch (err) {
      console.error(err);
      alert(err.message?.startsWith("Excel support") ? err.message : "Could not read the file.");
    }
  };

  const confirmImport = () => {
    const { added, skipped } = addEmployees(pending);
    setPending([]);
    alert(`${added} employee(s) imported.${skipped ? ` ${skipped} row(s) skipped.` : ""}`);
  };

  return (
    <div className="card mt-20">
      <div className="section-title">
        <div>
          <h3>👥 Employee Management</h3>
          <div className="muted">Add employees manually or import multiple employees from Excel.</div>
        </div>
        <div className="row-gap wrap">
          <button className="btn" onClick={() => setShowForm(true)}>+ Add Employee</button>
          <button className="btn secondary" onClick={downloadEmployeeTemplate}>⬇ Excel Template</button>
          <label className="btn secondary pointer">
            📥 Import Excel
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} hidden />
          </label>
        </div>
      </div>

      {showForm && <EmployeeForm onClose={() => setShowForm(false)} />}

      {pending.length > 0 && (
        <ExcelPreview rows={pending} existing={employees} onConfirm={confirmImport} onCancel={() => setPending([])} />
      )}
    </div>
  );
}
