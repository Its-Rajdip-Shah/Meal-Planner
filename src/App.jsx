import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Planner from './pages/Planner.jsx';
import logoUrl from '../Assets/logo.jpg';

export default function App() {
  return (
    <main className="min-h-screen text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="glass-panel p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <img
              alt="Biweekly Meal Planner logo"
              className="h-14 w-14 rounded-lg border border-white/10 object-cover shadow-lg shadow-emerald-950/30 sm:h-16 sm:w-16"
              src={logoUrl}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Biweekly Meal Planner
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                Private meal planning dashboard
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Plan two weeks of meals, keep leftovers visible, and build the grocery list from
                real cooking events.
              </p>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate replace to="/planner" />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/planner" element={<Planner />} />
          </Route>
          <Route path="*" element={<Navigate replace to="/planner" />} />
        </Routes>
      </div>
    </main>
  );
}
