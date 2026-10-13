import { useState } from "react";
import { useData } from "../../context/DataContext";

const blank = () => ({ id: "", name: "", username: "", password: "", status: "Active" });

export default function ManagersPage() {
  const { managers, settings, addManager, updateManager, deleteManager } = useData();
  const [form, setForm] = useState(null); // null = hidden, otherwise the manager being added/edited
  const editing = !!form?.existing;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    const name = form.name.trim();
    const username = form.username.trim();
    if (!name || !username || !form.password) { alert("Name, username and password are required."); return; }
    const taken = [...managers.filter((m) => m.id !== form.id).map((m) => m.username), settings.admin.username]
      .some((u) => String(u).toLowerCase() === username.toLowerCase());
    if (taken) { alert("Username already exists."); return; }

    if (editing) {
      updateManager(form.id, { name, username, password: form.password, status: form.status });
    } else {
      const next = managers.reduce((n, m) => Math.max(n, Number(String(m.id).replace(/\D/g, "")) || 0), 0) + 1;
      addManager({ id: `MGR-${String(next).padStart(3, "0")}`, name, username, password: form.password, status: form.status });
    }
    setForm(null);
  };

  const handleDelete = (m) => {
    if (!window.confirm(`Delete manager ${m.name}?`)) return;
    deleteManager(m.id);
  };

  return (
    <section>
      <div className="section-title">
        <div>
          <h2>Managers</h2>
          <div className="muted">Managers log in from the normal login page (Manager tab) and can monitor and update training records.</div>
        </div>
        <button className="btn" onClick={() => setForm({ ...blank() })}>+ Add Manager</button>
      </div>

      {form && (
        <div className="panel open mb-16">
          <h3>{editing ? `Edit Manager – ${form.id}` : "Add Manager"}</h3>
          <div className="grid cols-4 mt-12">
            <div><label className="muted" htmlFor="mg-name">Name *</label><input id="mg-name" className="admin-input" value={form.name} onChange={set("name")} /></div>
            <div><label className="muted" htmlFor="mg-user">Username *</label><input id="mg-user" className="admin-input" value={form.username} onChange={set("username")} /></div>
            <div><label className="muted" htmlFor="mg-pass">Password *</label><input id="mg-pass" className="admin-input" value={form.password} onChange={set("password")} /></div>
            <div>
              <label className="muted" htmlFor="mg-status">Status</label>
              <select id="mg-status" className="admin-input" value={form.status} onChange={set("status")}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="row-gap mt-15">
            <button className="btn" onClick={handleSave}>{editing ? "Save Changes" : "Create Manager"}</button>
            <button className="btn secondary" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        {managers.length === 0 && <div className="empty-row">No managers yet.</div>}
        {managers.map((m) => (
          <div className="admin-row" key={m.id}>
            <div>
              <div className="admin-row-title">
                {m.name} {m.status === "Inactive" && <span className="pill bad">Inactive</span>}
              </div>
              <div className="admin-row-meta">{m.id} • username: {m.username}</div>
            </div>
            <div className="row-gap">
              <button className="btn secondary" onClick={() => setForm({ ...m, existing: true })}>Edit</button>
              <button className="btn secondary" onClick={() => updateManager(m.id, { status: m.status === "Inactive" ? "Active" : "Inactive" })}>
                {m.status === "Inactive" ? "Activate" : "Deactivate"}
              </button>
              <button className="btn danger" onClick={() => handleDelete(m)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
