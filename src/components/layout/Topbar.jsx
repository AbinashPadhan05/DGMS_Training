import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo">MM</div> MineMagma Training
      </div>
      <div className="user">
        <span className="pill">{user.role === "admin" ? "Admin" : "Employee"}</span>{" "}
        <strong>{user.name}</strong>
        <button className="btn secondary btn-sm" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
