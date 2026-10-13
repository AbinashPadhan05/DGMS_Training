import { useAuth } from "../../context/AuthContext";

const ROLE_LABEL = { admin: "Admin", manager: "Manager", employee: "Employee" };

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo">MM</div> MineMagma Training
      </div>
      <div className="user">
        <span className="pill">{ROLE_LABEL[user.role]}</span>{" "}
        <strong>{user.name}</strong>
        <button className="btn secondary btn-sm" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
