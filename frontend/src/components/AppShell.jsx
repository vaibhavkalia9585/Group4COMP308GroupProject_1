import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FilePlus, LayoutDashboard, MessageCircle, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusStrip from './StatusStrip';

function navClass({ isActive }) {
  return `nav-link ${isActive ? 'nav-link-active' : ''}`;
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-ui-bg text-text-primary">
      <header className="border-b border-ui-border bg-brand-primary">
        <div className="mx-auto flex max-w-content items-center justify-between gap-6 px-6 py-3">
          <Link to="/" className="shrink-0 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white text-[14px] font-bold text-brand-primary">
              C
            </span>
            <span className="text-[15px] font-semibold text-white">CivicCase</span>
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-1">
            {user ? (
              <>
                <NavLink to="/report" className={navClass}>
                  <FilePlus size={15} strokeWidth={2} />
                  Report
                </NavLink>
                {user.role === 'STAFF' && (
                  <NavLink to="/staff" className={navClass}>
                    <LayoutDashboard size={15} strokeWidth={2} />
                    Dashboard
                  </NavLink>
                )}
                <NavLink to="/chatbot" className={navClass}>
                  <MessageCircle size={15} strokeWidth={2} />
                  CivicBot
                </NavLink>
                <NavLink to="/my-issues" className={navClass}>
                  <FileText size={15} strokeWidth={2} />
                  My reports
                </NavLink>
                <div className="mx-2 h-5 w-px bg-white/20" />
                <span className="px-2 text-body-sm text-blue-100">{user.name}</span>
                <button onClick={handleLogout} className="nav-link" title="Sign out">
                  <LogOut size={15} strokeWidth={2} />
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>
                  Sign in
                </NavLink>
                <Link
                  to="/register"
                  className="btn-ghost ml-2 border-white/20 bg-white text-brand-primary hover:border-white/30 hover:bg-blue-50"
                >
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {user && <StatusStrip />}

      <main className="mx-auto w-full max-w-content flex-1 px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-ui-border bg-ui-surface">
        <div className="mx-auto max-w-content px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-mono text-text-secondary">
              CivicCase · COMP308 Group 4 · {new Date().getFullYear()}
            </p>
            <div className="flex gap-6 text-body-sm text-text-secondary">
              <span>WCAG 2.1 AA</span>
              <span>cityservices@example.ca</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
