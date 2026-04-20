import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
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

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Auth micro-frontend */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Issue micro-frontend */}
          <Route path="/issues"     element={<ProtectedRoute><IssuesList /></ProtectedRoute>} />
          <Route path="/issues/:id" element={<ProtectedRoute><IssueDetail /></ProtectedRoute>} />
          <Route path="/report"     element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
          <Route path="/my-issues"  element={<ProtectedRoute><MyIssues /></ProtectedRoute>} />

          {/* Analytics micro-frontend */}
          <Route path="/staff"    element={<ProtectedRoute roles={['STAFF']}><StaffDashboard /></ProtectedRoute>} />
          <Route path="/advocate" element={<ProtectedRoute roles={['ADVOCATE']}><AdvocateDashboard /></ProtectedRoute>} />
          <Route path="/chatbot"  element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
