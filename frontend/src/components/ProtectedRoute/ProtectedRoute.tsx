import { type ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

interface ProtectedRouteProps {
    children?: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const user = useSelector((s: RootState) => s.user.user);
    if (user === undefined) return <div>Loading...</div>;
    if (user === null) return <Navigate to='/auth' />;

    return children ? children : <Outlet />;
}

export default ProtectedRoute;