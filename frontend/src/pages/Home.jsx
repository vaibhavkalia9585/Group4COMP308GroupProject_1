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
      {/* Hero */}
      <div className="mb-12">
        <p className="mb-3 font-mono text-label uppercase tracking-widest text-ink-mute">
          City of Example · Municipal Services
        </p>
        <h1 className="font-semibold text-ink text-display-xl leading-tight max-w-3xl">
          Report the things your city needs to fix.
        </h1>
        <p className="mt-5 text-body-lg text-ink-mute max-w-2xl">
          CivicCase is a public record of neighbourhood infrastructure issues.
          Submit a report, track it through triage, and see when it gets resolved —
          all in one place.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to={user ? '/report' : '/register'} className="btn-ink">
            <FilePlus size={16} strokeWidth={2} />
            Report a problem
          </Link>
          {user && (
            <Link to="/my-issues" className="btn-ghost">
              Track my reports
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          )}
          {!user && (
            <Link to="/login" className="btn-ghost">
              Sign in
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        {[
          [FilePlus, 'Report', 'Describe what you found and where. Takes under two minutes.'],
          [Clock, 'Track', 'Get notified when your report changes status.'],
          [CheckCircle2, 'Resolve', 'City staff address the issue and close the case publicly.'],
        ].map(([Icon, title, body], i) => (
          <div key={title} className="panel p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper-dim">
                <Icon size={17} strokeWidth={2} className="text-ink" />
              </div>
              <p className="font-semibold text-ink text-body-lg">{`${i + 1}. ${title}`}</p>
            </div>
            <p className="mt-3 text-body-sm text-ink-mute">{body}</p>
          </div>
        ))}
      </div>

      {/* Recent reports */}
      <div className="panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-ink text-display-md">Recent reports</h2>
          {user && (
            <Link to="/my-issues" className="link text-body-sm">
              See all →
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="text-body text-ink-mute py-6">No reports yet.</p>
        ) : (
          <div className="overflow-x-auto">
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
                      <span className="font-mono text-mono text-civic">
                        {shortId(issue.id)}
                      </span>
                    </td>
                    <td className="font-medium text-ink">{issue.title}</td>
                    <td className="text-ink-mute">{issue.category}</td>
                    <td><StatusDot value={issue.status} type="status" /></td>
                    <td className="font-mono text-mono text-ink-mute">{fmtDate(issue.createdAt)}</td>
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
