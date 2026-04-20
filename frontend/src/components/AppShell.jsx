import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FilePlus, LayoutDashboard, MessageCircle, FileText, LogOut, Users, List, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusStrip from './StatusStrip';

function navClass({ isActive }) {
  return `nav-link ${isActive ? 'nav-link-active' : ''}`;
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const close = () => setMenuOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-ui-bg text-text-primary">
      <header className="border-b border-ui-border bg-brand-primary" style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.18)' }}>
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-2.5" onClick={close}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white text-[14px] font-bold text-brand-primary">
              C
            </span>
            <span className="text-[15px] font-semibold text-white">CivicCase</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <NavLink to="/issues" className={navClass}><List size={15} strokeWidth={2} />Issues</NavLink>
                <NavLink to="/report" className={navClass}><FilePlus size={15} strokeWidth={2} />Report</NavLink>
                {user.role === 'STAFF' && (
                  <NavLink to="/staff" className={navClass}><LayoutDashboard size={15} strokeWidth={2} />Dashboard</NavLink>
                )}
                {user.role === 'ADVOCATE' && (
                  <NavLink to="/advocate" className={navClass}><Users size={15} strokeWidth={2} />Community</NavLink>
                )}
                <NavLink to="/chatbot" className={navClass}><MessageCircle size={15} strokeWidth={2} />CivicBot</NavLink>
                <NavLink to="/my-issues" className={navClass}><FileText size={15} strokeWidth={2} />My reports</NavLink>
                <div className="mx-2 h-5 w-px bg-white/20" />
                <span className="px-2 text-body-sm text-blue-100">{user.name}</span>
                <button onClick={handleLogout} className="nav-link" title="Sign out">
                  <LogOut size={15} strokeWidth={2} />
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>Sign in</NavLink>
                <Link to="/register" className="btn-ghost ml-2 border-white/20 bg-white text-brand-primary hover:border-white/30 hover:bg-blue-50">
                  Create account
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden nav-link"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-brand-primary px-4 pb-4 pt-2 flex flex-col gap-1">
            {user ? (
              <>
                <p className="px-2 py-1.5 text-body-sm text-blue-200">{user.name}</p>
                <NavLink to="/issues"   className={navClass} onClick={close}><List size={15} strokeWidth={2} />Issues</NavLink>
                <NavLink to="/report"   className={navClass} onClick={close}><FilePlus size={15} strokeWidth={2} />Report</NavLink>
                {user.role === 'STAFF' && (
                  <NavLink to="/staff" className={navClass} onClick={close}><LayoutDashboard size={15} strokeWidth={2} />Dashboard</NavLink>
                )}
                {user.role === 'ADVOCATE' && (
                  <NavLink to="/advocate" className={navClass} onClick={close}><Users size={15} strokeWidth={2} />Community</NavLink>
                )}
                <NavLink to="/chatbot"  className={navClass} onClick={close}><MessageCircle size={15} strokeWidth={2} />CivicBot</NavLink>
                <NavLink to="/my-issues" className={navClass} onClick={close}><FileText size={15} strokeWidth={2} />My reports</NavLink>
                <button onClick={handleLogout} className="nav-link justify-start mt-1">
                  <LogOut size={15} strokeWidth={2} />Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login"    className={navClass} onClick={close}>Sign in</NavLink>
                <NavLink to="/register" className={navClass} onClick={close}>Create account</NavLink>
              </>
            )}
          </div>
        )}
      </header>

      {user && <StatusStrip />}

      <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>

      <footer className="border-t border-ui-border bg-ui-surface">
        <div className="mx-auto max-w-content px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-mono text-text-secondary">
              CivicCase · COMP308 Group 4 · {new Date().getFullYear()}
            </p>
            <div className="flex gap-4 text-body-sm text-text-secondary">
              <span>WCAG 2.1 AA</span>
              <span>cityservices@example.ca</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
