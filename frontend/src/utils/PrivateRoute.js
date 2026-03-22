import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, requiredRole }) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    // Not logged in at all
    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    // Wrong role
    if (requiredRole && user.role !== requiredRole) {
        if (user.role === "host") return <Navigate to="/host" replace />;
        return <Navigate to="/user" replace />;
    }

    return children;
}