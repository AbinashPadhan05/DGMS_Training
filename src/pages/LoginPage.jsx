import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { goTo, navigate } from "../utils/router";

const COPY = {
  manager: {
    title: "Manager Login",
    text: "Monitor employee training, assessment and certification status.",
    button: "Login as Manager",
  },
  admin: {
    title: "Administrator Login",
    text: "Restricted area. Authorised administrators only.",
    button: "Login as Administrator",
  },
  employee: {
    title: "Employee Login",
    text: "View your training status, take the assessment and get your certificate.",
    button: "Login as Employee",
  },
};

// variant "staff": Employee / Manager tabs (home page). variant "admin": administrator only (/admin).
export default function LoginPage({ variant = "staff" }) {
  const { login } = useAuth();
  const [role, setRole] = useState(() => {
    if (variant === "admin") return "admin";
    const wanted = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("role");
    return wanted === "manager" ? "manager" : "employee";
  });
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
    const problem = login(role, username, password);
    setError(problem || "");
    if (!problem && variant === "staff") navigate("/");
  };

  return (
    <div className="login-screen">
      <div className="login-side">
        <div className="login-side-top">
          <div className="login-brand">
            <div className="logo big">MM</div>
            <div className="brand-title">MineMagma</div>
          </div>
          <h1>Training tracking and monitoring for mines.</h1>
          <p>Attendance, assessment, certificates and records, kept against DGMS Circular 01/2026.</p>
        </div>
        <div className="login-side-foot">Demo prototype</div>
      </div>

      <section className="login-main">
        {variant === "staff" && (
          <a className="login-back" href="/" onClick={goTo("/")}>Back to home</a>
        )}

        <div className="login-card">
          {variant === "staff" && (
            <div className="login-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={role === "employee"} className={`login-tab ${role === "employee" ? "active" : ""}`} onClick={() => selectRole("employee")}>
                Employee
              </button>
              <button type="button" role="tab" aria-selected={role === "manager"} className={`login-tab ${role === "manager" ? "active" : ""}`} onClick={() => selectRole("manager")}>
                Manager
              </button>
            </div>
          )}

          <div className="login-intro">
            <h2>{copy.title}</h2>
            <p className="muted">{copy.text}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="loginUsername">Username / Employee ID</label>
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

            <label htmlFor="loginPassword">Password</label>
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

          {variant === "staff" && (
            <div className="demo-credentials">
              <strong>Demo credentials</strong>
              {role === "employee" ? (
                <div>Employee: <code>employee</code> / <code>employee123</code></div>
              ) : (
                <div>Manager: <code>manager</code> / <code>manager123</code></div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
