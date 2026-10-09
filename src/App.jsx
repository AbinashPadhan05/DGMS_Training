import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import AppShell from "./components/layout/AppShell";
import LoginPage from "./pages/LoginPage";

function Root() {
  const { user } = useAuth();
  return user ? <AppShell /> : <LoginPage />;
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
