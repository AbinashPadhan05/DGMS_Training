import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

// The logged-in employee's record (undefined for admins).
export default function useCurrentEmployee() {
  const { user } = useAuth();
  const { employees } = useData();
  return user?.role === "employee" ? employees.find((x) => x.id === user.id) : undefined;
}
