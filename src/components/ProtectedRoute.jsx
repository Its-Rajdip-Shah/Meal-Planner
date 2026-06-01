import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-[#d4a262]/25 bg-[#513a24]/65 p-6 text-sm text-[#fffbb6]/80 shadow-xl shadow-[#21150b]/35 backdrop-blur">
        Checking session...
      </div>
    );
  }

  if (!user) {
    return <Navigate replace to="/login" state={{ from: location }} />;
  }

  return <Outlet />;
}
