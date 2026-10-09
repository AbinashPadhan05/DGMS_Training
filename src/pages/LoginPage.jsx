import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const COPY = {
  employee: {
    title: "Employee Login",
    text: "View your training status, take the assessment and get your certificate.",
    button: "Login as Employee",
  },
  admin: {
    title: "Admin Login",
    text: "Monitor employee training, assessment and certification status.",
    button: "Login as Admin",
  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState("employee");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const copy = COPY[role];

  const selectRole = (next) => {
    setRole(next);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(login(role, username, password) || "");
  };

  return (
    <div className="login-screen">
      <div className="login-shell">
        <div className="login-brand">
          <div className="logo big">MM</div>
          <div>
            <div className="brand-title">MineMagma</div>
            <div className="muted">Training Tracking & Monitoring Platform</div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-tabs">
            <button type="button" className={`login-tab ${role === "employee" ? "active" : ""}`} onClick={() => selectRole("employee")}>
              👷 Employee Login
            </button>
            <button type="button" className={`login-tab ${role === "admin" ? "active" : ""}`} onClick={() => selectRole("admin")}>
              ⚙️ Admin Login
            </button>
          </div>

          <div>
            <h2>{copy.title}</h2>
            <p className="muted">{copy.text}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="muted" htmlFor="loginUsername">Username / Employee ID</label>
            <input
              id="loginUsername"
              className="login-input"
              placeholder="Enter username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />

            <label className="muted" htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              className="login-input"
              type="password"
              placeholder="Enter password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="btn login-btn" type="submit">{copy.button}</button>
            <div className="login-error" role="alert">{error}</div>
          </form>

          <div className="demo-credentials">
            <strong>Demo credentials</strong>
            {role === "employee" ? (
              <div>Employee: <code>employee</code> / <code>employee123</code></div>
            ) : (
              <div>Admin: <code>admin</code> / <code>admin123</code></div>
            )}
          </div>
        </div>

        <div className="login-footer">© MineMagma • Demo Prototype</div>
      </div>
    </div>
  );
}
