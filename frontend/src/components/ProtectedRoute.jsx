import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = typeof window !== "undefined" && localStorage.getItem("cga_token");
  if (!token) {
    return <Navigate to="/om-admin/login" state={{ from: location }} replace />;
  }
  return children;
}
