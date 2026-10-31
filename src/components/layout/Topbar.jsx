import { useAuth } from "../../context/AuthContext";
import { navigate } from "../../utils/router";

const ROLE_LABEL = { admin: "Admin", manager: "Manager", employee: "Employee" };

export default function Topbar() {
  const { user, logout } = useAuth();
  const handleLogout = () => {
    const wasAdmin = user.role === "admin";
    logout();
    if (!wasAdmin) navigate("/"); // staff land back on the public home page; /admin stays put
  };
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo">MM</div>
        <span>MineMagma Training</span>
      </div>
      <div className="user">
        <span className="pill">{ROLE_LABEL[user.role]}</span>
        <strong className="user-name">{user.name}</strong>
        <button className="btn secondary btn-sm" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}
