import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { ArrowRight, FilePlus, Clock, CheckCircle2 } from 'lucide-react';
import { ISSUES_QUERY } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import StatusDot from '../components/StatusDot';

function fmtDate(ts) {
  return new Date(Number(ts) || ts).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function shortId(id) {
  return id?.slice(-6).toUpperCase();
}

export default function Home() {
  const { user } = useAuth();
  const { data } = useQuery(ISSUES_QUERY, {
    variables: { filter: {} },
    fetchPolicy: 'cache-and-network',
  });

  const recent = data?.issues?.slice(0, 5) ?? [];

  return (
    <div>
      <div className="mb-12 rounded-2xl bg-ui-surface p-8 shadow-sm ring-1 ring-ui-border">
        <p className="mb-3 font-mono text-label uppercase tracking-widest text-text-secondary">
          City of Example · Municipal Services
        </p>
        <h1 className="max-w-3xl text-display-xl font-semibold leading-tight text-text-primary">
          Report the things your city needs to fix.
        </h1>
        <p className="mt-5 max-w-2xl text-body-lg text-text-secondary">
          CivicCase is a public record of neighbourhood infrastructure issues.
          Submit a report, track it through triage, and see when it gets resolved,
          all in one place.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to={user ? '/report' : '/register'} className="btn-ink">
            <FilePlus size={16} strokeWidth={2} />
            Report a problem
          </Link>
          {user ? (
            <Link to="/my-issues" className="btn-ghost">
              Track my reports
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          ) : (
            <Link to="/login" className="btn-ghost">
              Sign in
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          )}
        </div>
      </div>

      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        {[
          [FilePlus, 'Report', 'Describe what you found and where. Takes under two minutes.'],
          [Clock, 'Track', 'Get notified when your report changes status.'],
          [CheckCircle2, 'Resolve', 'City staff address the issue and close the case publicly.'],
        ].map(([Icon, title, body], i) => (
          <div key={title} className="panel p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Icon size={17} strokeWidth={2} className="text-brand-primary" />
              </div>
              <p className="text-body-lg font-semibold text-text-primary">{`${i + 1}. ${title}`}</p>
            </div>
            <p className="mt-3 text-body-sm text-text-secondary">{body}</p>
          </div>
        ))}
      </div>

      <div className="panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-display-md font-semibold text-text-primary">Recent reports</h2>
          {user && (
            <Link to="/my-issues" className="link text-body-sm">
              See all →
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="py-6 text-body text-text-secondary">No reports yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-ui-border bg-ui-surface">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '6rem' }}>ID</th>
                  <th>Title</th>
                  <th style={{ width: '9rem' }}>Category</th>
                  <th style={{ width: '9rem' }}>Status</th>
                  <th style={{ width: '8rem' }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((issue) => (
                  <tr key={issue.id}>
                    <td>
                      <span className="font-mono text-mono text-brand-primary">
                        {shortId(issue.id)}
                      </span>
                    </td>
                    <td className="font-medium text-text-primary">{issue.title}</td>
                    <td className="text-text-secondary">{issue.category}</td>
                    <td><StatusDot value={issue.status} type="status" /></td>
                    <td className="font-mono text-mono text-text-secondary">{fmtDate(issue.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
