import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';

// ── Auth micro-frontend ──────────────────────────────────────────────────────
const Login    = lazy(() => import('./apps/auth/AuthApp').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./apps/auth/AuthApp').then(m => ({ default: m.Register })));

// ── Issue Reporting & Tracking micro-frontend ────────────────────────────────
const IssuesList  = lazy(() => import('./apps/issues/IssuesApp').then(m => ({ default: m.IssuesList })));
const ReportIssue = lazy(() => import('./apps/issues/IssuesApp').then(m => ({ default: m.ReportIssue })));
const MyIssues    = lazy(() => import('./apps/issues/IssuesApp').then(m => ({ default: m.MyIssues })));
const IssueDetail = lazy(() => import('./apps/issues/IssuesApp').then(m => ({ default: m.IssueDetail })));

// ── Analytics & Administration micro-frontend ────────────────────────────────
const StaffDashboard    = lazy(() => import('./apps/analytics/AnalyticsApp').then(m => ({ default: m.StaffDashboard })));
const AdvocateDashboard = lazy(() => import('./apps/analytics/AnalyticsApp').then(m => ({ default: m.AdvocateDashboard })));
const Chatbot           = lazy(() => import('./apps/analytics/AnalyticsApp').then(m => ({ default: m.Chatbot })));

function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <span className="text-body-sm text-ink-mute">Loading…</span>
    </div>
  );
}

function P({ children }) {
  return <PageTransition>{children}</PageTransition>;
}

export default function App() {
  const location = useLocation();

  return (
    <AppShell>
      <Suspense fallback={<Loading />}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<P><Home /></P>} />

            {/* Auth micro-frontend */}
            <Route path="/login"    element={<P><Login /></P>} />
            <Route path="/register" element={<P><Register /></P>} />

            {/* Issue micro-frontend */}
            <Route path="/issues"     element={<P><ProtectedRoute><IssuesList /></ProtectedRoute></P>} />
            <Route path="/issues/:id" element={<P><ProtectedRoute><IssueDetail /></ProtectedRoute></P>} />
            <Route path="/report"     element={<P><ProtectedRoute><ReportIssue /></ProtectedRoute></P>} />
            <Route path="/my-issues"  element={<P><ProtectedRoute><MyIssues /></ProtectedRoute></P>} />

            {/* Analytics micro-frontend */}
            <Route path="/staff"    element={<P><ProtectedRoute roles={['STAFF']}><StaffDashboard /></ProtectedRoute></P>} />
            <Route path="/advocate" element={<P><ProtectedRoute roles={['ADVOCATE']}><AdvocateDashboard /></ProtectedRoute></P>} />
            <Route path="/chatbot"  element={<P><ProtectedRoute><Chatbot /></ProtectedRoute></P>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </AppShell>
  );
}
