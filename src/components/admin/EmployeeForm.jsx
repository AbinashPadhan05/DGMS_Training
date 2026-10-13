import { useState } from "react";
import { EMPLOYEE_TYPES } from "../../constants/config";
import { useData } from "../../context/DataContext";
import { getDefaultCourse, getDefaultPassword } from "../../utils/settings";
import { idExists, typeOf, usernameExists } from "../../utils/training";

const FIELDS = [
  { key: "id", label: "Employee ID *", placeholder: "EMP-006" },
  { key: "name", label: "Employee Name *", placeholder: "Full name" },
  { key: "department", label: "Department", placeholder: "Mining" },
  { key: "designation", label: "Designation", placeholder: "Mining Mate" },
  { key: "mine", label: "Mine / Site", placeholder: "Bolani" },
  { key: "email", label: "Email", placeholder: "employee@example.com", type: "email" },
  { key: "mobile", label: "Mobile", placeholder: "10-digit mobile" },
  { key: "joining", label: "Joining Date", type: "date" },
  { key: "username", label: "Username *", placeholder: "employee006" },
  { key: "password", label: "Password *" },
];

const blank = () => ({
  id: "", name: "", department: "", designation: "", mine: "", email: "", mobile: "",
  joining: "", type: "Regular", contractor: "", course: getDefaultCourse(),
  username: "", password: getDefaultPassword(), status: "Active",
});

// Add mode (no `employee`) or edit mode (`employee` given: ID stays fixed, progress/assessment data is kept).
export default function EmployeeForm({ employee, onClose }) {
  const { employees, circulars, addEmployee, updateEmployee } = useData();
  const editing = !!employee;
  const [form, setForm] = useState(() => (editing ? { ...blank(), ...employee, type: typeOf(employee), contractor: employee.contractor || "" } : blank()));

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const others = editing ? employees.filter((x) => x.id !== employee.id) : employees;
  const courses = [...new Set(circulars.map((c) => c.course).filter(Boolean))];

  const handleSubmit = () => {
    const id = form.id.trim();
    const name = form.name.trim();
    const username = form.username.trim();

    if (!id || !name || !username || !form.password) { alert("Please fill all required fields."); return; }
    if (!editing && idExists(employees, id)) { alert("Employee ID already exists."); return; }
    if (usernameExists(others, username)) { alert("Username already exists."); return; }

    const data = {
      name, username, password: form.password,
      department: form.department.trim(),
      designation: form.designation.trim(),
      mine: form.mine.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      joining: form.joining,
      type: form.type,
      contractor: form.type === "Contractual" ? form.contractor.trim() : "",
      course: form.course.trim() || getDefaultCourse(),
      status: form.status || "Active",
    };

    if (editing) {
      updateEmployee(employee.id, data);
    } else {
      addEmployee({ id, ...data, progress: 0, score: null, practical: "Pending", ojt: "Pending", certificate: "Pending" });
    }
    onClose();
    alert(editing ? "Employee updated." : "Employee added successfully.");
  };

  return (
    <div className="panel open">
      <h3>{editing ? `Edit Employee – ${employee.name}` : "Add New Employee"}</h3>
      <div className="grid cols-3 mt-12">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="muted" htmlFor={`emp-${f.key}`}>{f.label}</label>
            <input
              id={`emp-${f.key}`}
              className="admin-input"
              type={f.type || "text"}
              placeholder={f.placeholder}
              value={form[f.key]}
              disabled={editing && f.key === "id"}
              onChange={set(f.key)}
            />
          </div>
        ))}
        <div>
          <label className="muted" htmlFor="emp-type">Employee Type *</label>
          <select id="emp-type" className="admin-input" value={form.type} onChange={set("type")}>
            {EMPLOYEE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        {form.type === "Contractual" && (
          <div>
            <label className="muted" htmlFor="emp-contractor">Contractor / Agency</label>
            <input id="emp-contractor" className="admin-input" placeholder="Contractor name" value={form.contractor} onChange={set("contractor")} />
          </div>
        )}
        <div>
          <label className="muted" htmlFor="emp-course">Training Programme</label>
          <input id="emp-course" className="admin-input" list="course-options" value={form.course} onChange={set("course")} />
          <datalist id="course-options">{courses.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
        <div>
          <label className="muted" htmlFor="emp-status">Status</label>
          <select id="emp-status" className="admin-input" value={form.status} onChange={set("status")}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>
      <div className="row-gap mt-15">
        <button className="btn" onClick={handleSubmit}>{editing ? "Save Changes" : "Create Employee"}</button>
        <button className="btn secondary" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
