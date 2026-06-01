import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-white/10 bg-white/10 p-6 text-sm text-slate-300 shadow-xl backdrop-blur">
        Checking session...
      </div>
    );
  }

  if (!user) {
    return <Navigate replace to="/login" state={{ from: location }} />;
  }

  return <Outlet />;
}
