import { useState } from "react";
import { useData } from "../../context/DataContext";
import { today } from "../../utils/training";

export default function SettingsPage() {
  const { settings, updateSettings, exportBackup, restoreBackup, resetAllData } = useData();
  const [general, setGeneral] = useState({
    passMark: String(settings.passMark),
    refresherMonths: String(settings.refresherMonths),
    defaultCourse: settings.defaultCourse,
    defaultPassword: settings.defaultPassword,
  });
  const [acct, setAcct] = useState({ name: settings.admin.name, username: settings.admin.username, password: "" });

  const saveGeneral = () => {
    const pm = Number(general.passMark);
    if (!(pm >= 1 && pm <= 100)) { alert("Pass mark must be between 1 and 100."); return; }
    const rm = Number(general.refresherMonths);
    if (!(rm >= 1 && rm <= 240)) { alert("Refresher interval must be between 1 and 240 months."); return; }
    if (!general.defaultCourse.trim() || !general.defaultPassword) { alert("Default course and password are required."); return; }
    updateSettings({ passMark: pm, refresherMonths: rm, defaultCourse: general.defaultCourse.trim(), defaultPassword: general.defaultPassword });
    alert("Settings saved.");
  };

  const saveAccount = () => {
    if (!acct.name.trim() || !acct.username.trim()) { alert("Name and username are required."); return; }
    if (acct.password && acct.password.length < 6) { alert("New password must be at least 6 characters."); return; }
    updateSettings({ admin: { name: acct.name.trim(), username: acct.username.trim(), ...(acct.password ? { password: acct.password } : {}) } });
    setAcct((a) => ({ ...a, password: "" }));
    alert("Administrator account updated.");
  };

  const backup = () => {
    const blob = new Blob([JSON.stringify(exportBackup(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `MineMagma_Backup_${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };

  const restore = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!window.confirm("Restoring replaces ALL current data with the backup. Continue?")) return;
    try {
      const err = restoreBackup(JSON.parse(await file.text()));
      alert(err || "Backup restored.");
    } catch {
      alert("Could not read the backup file.");
    }
  };

  const reset = () => {
    if (!window.confirm("Delete ALL employees, managers, circulars and questions and restore the sample data?")) return;
    resetAllData();
    alert("All data reset to sample data.");
  };

  return (
    <section>
      <div className="section-title"><h2>Settings</h2></div>

      <div className="card">
        <h3>General</h3>
        <div className="grid cols-3 mt-0">
          <div><label className="muted" htmlFor="st-pm">Assessment pass mark (%)</label><input id="st-pm" type="number" min="1" max="100" className="admin-input" value={general.passMark} onChange={(e) => setGeneral((g) => ({ ...g, passMark: e.target.value }))} /></div>
          <div>
            <label className="muted" htmlFor="st-rm">Refresher interval (months)</label>
            <input id="st-rm" type="number" min="1" max="240" className="admin-input" value={general.refresherMonths} onChange={(e) => setGeneral((g) => ({ ...g, refresherMonths: e.target.value }))} />
            <div className="admin-row-meta">The circular does not state the interval (it is set by Rule 159). Confirm the correct value before use.</div>
          </div>
          <div><label className="muted" htmlFor="st-course">Default training programme</label><input id="st-course" className="admin-input" value={general.defaultCourse} onChange={(e) => setGeneral((g) => ({ ...g, defaultCourse: e.target.value }))} /></div>
          <div><label className="muted" htmlFor="st-pw">Default employee password</label><input id="st-pw" className="admin-input" value={general.defaultPassword} onChange={(e) => setGeneral((g) => ({ ...g, defaultPassword: e.target.value }))} /></div>
        </div>
        <button className="btn" onClick={saveGeneral}>Save Settings</button>
      </div>

      <div className="card mt-18">
        <h3>Administrator account</h3>
        <p className="muted">Used to log in at /admin. Leave the password blank to keep it unchanged.</p>
        <div className="grid cols-3 mt-0">
          <div><label className="muted" htmlFor="ad-name">Name</label><input id="ad-name" className="admin-input" value={acct.name} onChange={(e) => setAcct((a) => ({ ...a, name: e.target.value }))} /></div>
          <div><label className="muted" htmlFor="ad-user">Username</label><input id="ad-user" className="admin-input" value={acct.username} onChange={(e) => setAcct((a) => ({ ...a, username: e.target.value }))} /></div>
          <div><label className="muted" htmlFor="ad-pass">New password</label><input id="ad-pass" type="password" className="admin-input" value={acct.password} onChange={(e) => setAcct((a) => ({ ...a, password: e.target.value }))} autoComplete="new-password" /></div>
        </div>
        <button className="btn" onClick={saveAccount}>Update Account</button>
      </div>

      <div className="card mt-18">
        <h3>Data backup</h3>
        <p className="muted">All data is stored in this browser. Download a backup file to keep a copy or move it to another browser.</p>
        <div className="row-gap wrap">
          <button className="btn secondary" onClick={backup}>⬇ Download Backup</button>
          <label className="btn secondary pointer">
            📥 Restore Backup
            <input type="file" accept=".json,application/json" onChange={restore} hidden />
          </label>
          <button className="btn danger" onClick={reset}>Reset All Data</button>
        </div>
      </div>
    </section>
  );
}
