import { useState } from "react";
import { DEFAULT_COURSE, DEFAULT_PASSWORD } from "../../constants/config";
import { useData } from "../../context/DataContext";
import { idExists, usernameExists } from "../../utils/training";

const EMPTY = {
  id: "", name: "", department: "", designation: "", mine: "", email: "", mobile: "",
  joining: "", course: DEFAULT_COURSE, username: "", password: DEFAULT_PASSWORD, status: "Active",
};

const FIELDS = [
  { key: "id", label: "Employee ID *", placeholder: "EMP-006" },
  { key: "name", label: "Employee Name *", placeholder: "Full name" },
  { key: "department", label: "Department", placeholder: "Mining" },
  { key: "designation", label: "Designation", placeholder: "Mining Mate" },
  { key: "mine", label: "Mine / Site", placeholder: "Bolani" },
  { key: "email", label: "Email", placeholder: "employee@example.com", type: "email" },
  { key: "mobile", label: "Mobile", placeholder: "10-digit mobile" },
  { key: "joining", label: "Joining Date", type: "date" },
  { key: "course", label: "Training Programme" },
  { key: "username", label: "Username *", placeholder: "employee006" },
  { key: "password", label: "Temporary Password *" },
];

export default function EmployeeForm({ onClose }) {
  const { employees, addEmployee } = useData();
  const [form, setForm] = useState(EMPTY);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = () => {
    const id = form.id.trim();
    const name = form.name.trim();
    const username = form.username.trim();

    if (!id || !name || !username || !form.password) { alert("Please fill all required fields."); return; }
    if (idExists(employees, id)) { alert("Employee ID already exists."); return; }
    if (usernameExists(employees, username)) { alert("Username already exists."); return; }

    addEmployee({
      id, name, username, password: form.password,
      department: form.department.trim(),
      designation: form.designation.trim(),
      mine: form.mine.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      joining: form.joining,
      course: form.course.trim() || DEFAULT_COURSE,
      progress: 0, score: null, practical: "Pending", ojt: "Pending", certificate: "Pending",
      status: form.status || "Active",
    });
    onClose();
    alert("Employee added successfully.");
  };

  return (
    <div className="panel open">
      <h3>Add New Employee</h3>
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
              onChange={set(f.key)}
            />
          </div>
        ))}
        <div>
          <label className="muted" htmlFor="emp-status">Status</label>
          <select id="emp-status" className="admin-input" value={form.status} onChange={set("status")}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>
      <div className="row-gap mt-15">
        <button className="btn" onClick={handleSubmit}>Create Employee</button>
        <button className="btn secondary" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
