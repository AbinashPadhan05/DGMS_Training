import { ADMIN_PATH } from "./constants/config";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import AdminShell from "./components/layout/AdminShell";
import AppShell from "./components/layout/AppShell";
import LoginPage from "./pages/LoginPage";

const isAdminRoute = () => {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path === ADMIN_PATH || path.startsWith(`${ADMIN_PATH}/`);
};

function Root() {
  const { user } = useAuth();

  // /admin is a separate, unlinked entry point. Nothing on the normal site points to it.
  if (isAdminRoute()) {
    return user?.role === "admin" ? <AdminShell /> : <LoginPage variant="admin" />;
  }
  // An admin session never opens the employee/manager site.
  if (!user || user.role === "admin") return <LoginPage variant="staff" />;
  return <AppShell />;
}

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </DataProvider>
  );
}
