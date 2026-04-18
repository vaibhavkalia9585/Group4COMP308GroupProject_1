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
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Top nav */}
      <header className="border-b border-rule bg-white">
        <div className="mx-auto flex max-w-content items-center justify-between gap-6 px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-paper text-[14px] font-bold">
              C
            </span>
            <span className="font-semibold text-ink text-[15px]">CivicCase</span>
          </Link>

          <nav className="flex items-center gap-1 flex-wrap justify-end">
            {user && (
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
                <div className="mx-2 h-5 w-px bg-rule" />
                <span className="text-body-sm text-ink-mute px-2">{user.name}</span>
                <button onClick={handleLogout} className="nav-link" title="Sign out">
                  <LogOut size={15} strokeWidth={2} />
                </button>
              </>
            )}
            {!user && (
              <>
                <NavLink to="/login" className={navClass}>Sign in</NavLink>
                <Link to="/register" className="btn-ink ml-2">Create account</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Status strip — only when logged in */}
      {user && <StatusStrip />}

      {/* Page content */}
      <main className="mx-auto w-full max-w-content flex-1 px-6 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-rule bg-white">
        <div className="mx-auto max-w-content px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-mono text-ink-faint">
              CivicCase · COMP308 Group 4 · {new Date().getFullYear()}
            </p>
            <div className="flex gap-6 text-body-sm text-ink-mute">
              <span>WCAG 2.1 AA</span>
              <span>cityservices@example.ca</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
