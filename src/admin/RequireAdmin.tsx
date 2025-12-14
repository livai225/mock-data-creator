import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate("/connexion", { state: { redirectTo: location.pathname }, replace: true });
      return;
    }

    if (user?.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, location.pathname, navigate, user?.role]);

  if (loading) return null;
  if (!isAuthenticated) return null;
  if (user?.role !== "admin") return null;

  return <>{children}</>;
}
