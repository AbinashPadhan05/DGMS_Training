import { ADMIN_PATH } from "./constants/config";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import AdminShell from "./components/layout/AdminShell";
import AppShell from "./components/layout/AppShell";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import { useLocation } from "./utils/router";

const cleanPath = (loc) => loc.split("?")[0].replace(/\/+$/, "") || "/";
const isAdminRoute = (loc) => {
  const path = cleanPath(loc);
  return path === ADMIN_PATH || path.startsWith(`${ADMIN_PATH}/`);
};

function Root() {
  const { user } = useAuth();
  const loc = useLocation();

  // /admin is a separate, unlinked entry point. Nothing on the normal site points to it.
  if (isAdminRoute(loc)) {
    return user?.role === "admin" ? <AdminShell /> : <LoginPage variant="admin" />;
  }
  // An admin session never opens the employee/manager site.
  if (user && user.role !== "admin") return <AppShell />;
  // Signed-out visitors (and admin sessions) see the public landing page, with sign-in at /login.
  return cleanPath(loc) === "/login" ? <LoginPage variant="staff" /> : <LandingPage />;
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
