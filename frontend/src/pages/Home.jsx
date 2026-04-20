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

const STEPS = [
  { Icon: FilePlus,     step: '01', title: 'Report',  body: 'Describe what you found and where. Takes under two minutes.' },
  { Icon: Clock,        step: '02', title: 'Track',   body: 'Get notified when your report changes status.' },
  { Icon: CheckCircle2, step: '03', title: 'Resolve', body: 'City staff address the issue and close the case publicly.' },
];

export default function Home() {
  const { user } = useAuth();
  const { data } = useQuery(ISSUES_QUERY, {
    variables: { filter: {} },
    fetchPolicy: 'cache-and-network',
  });

  const issues   = data?.issues ?? [];
  const recent   = issues.slice(0, 5);
  const openCount       = issues.filter((i) => i.status === 'OPEN').length;
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolvedCount   = issues.filter((i) => i.status === 'RESOLVED').length;

  return (
    <div className="mx-auto max-w-5xl space-y-12">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-ui-surface ring-1 ring-ui-border">
        {/* subtle dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right,#000 1px,transparent 1px),linear-gradient(to bottom,#000 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative px-8 py-12 sm:px-14 sm:py-16">
          {/* eyebrow pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ui-border bg-white px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
            <span className="font-mono text-label uppercase tracking-widest text-text-secondary">
              City of Example · Municipal Services
            </span>
          </div>

          <h1 className="max-w-2xl text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-text-primary sm:text-[3.2rem]">
            Report the things<br />your city needs to fix.
          </h1>

          <p className="mt-5 max-w-lg text-body-lg text-text-secondary">
            CivicCase is a public record of neighbourhood infrastructure issues.
            Submit a report, track it through triage, and see when it gets resolved, all in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={user ? '/report' : '/register'} className="btn-ink">
              <FilePlus size={16} strokeWidth={2} />
              Report a problem
            </Link>
            {user ? (
              <Link to="/my-issues" className="btn-ghost">
                Track my reports <ArrowRight size={16} strokeWidth={2} />
              </Link>
            ) : (
              <Link to="/login" className="btn-ghost">
                Sign in <ArrowRight size={16} strokeWidth={2} />
              </Link>
            )}
          </div>

          {/* live stats strip */}
          {data && (
            <div className="mt-10 flex flex-wrap gap-8 border-t border-ui-border pt-8">
              {[
                { label: 'Open',        value: openCount,       color: 'text-brand-primary' },
                { label: 'In progress', value: inProgressCount, color: 'text-blue-400' },
                { label: 'Resolved',    value: resolvedCount,   color: 'text-text-secondary' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className={`text-4xl font-semibold leading-none tabular-nums ${color}`}>{value}</span>
                  <span className="text-body-sm text-text-secondary">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── How it works ── */}
      <div>
        <p className="mb-5 font-mono text-label uppercase tracking-widest text-text-secondary">
          How it works
        </p>
        <div className="overflow-hidden rounded-2xl ring-1 ring-ui-border sm:grid sm:grid-cols-3">
          {STEPS.map(({ Icon, step, title, body }, i) => (
            <div
              key={title}
              className={`flex flex-col gap-5 bg-ui-surface p-8 ${
                i < 2 ? 'border-b border-ui-border sm:border-b-0 sm:border-r' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <Icon size={20} strokeWidth={2} className="text-brand-primary" />
                </div>
                <span className="select-none font-mono text-[2.5rem] font-bold leading-none text-ui-border">
                  {step}
                </span>
              </div>
              <div>
                <p className="text-body-lg font-semibold text-text-primary">{title}</p>
                <p className="mt-1.5 text-body-sm text-text-secondary">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent reports ── */}
      <div className="overflow-hidden rounded-2xl bg-ui-surface ring-1 ring-ui-border">
        <div className="flex items-center justify-between border-b border-ui-border px-6 py-5">
          <div className="flex items-center gap-3">
            <h2 className="text-display-md font-semibold text-text-primary">Recent reports</h2>
            {recent.length > 0 && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-mono text-label text-brand-primary">
                {recent.length}
              </span>
            )}
          </div>
          <Link
            to="/issues"
            className="link inline-flex items-center gap-1 text-body-sm"
          >
            See all <ArrowRight size={13} strokeWidth={2} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-6 py-10 text-body text-text-secondary">No reports yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '6rem' }}>ID</th>
                  <th>Title</th>
                  <th className="hidden sm:table-cell" style={{ width: '9rem' }}>Category</th>
                  <th style={{ width: '9rem' }}>Status</th>
                  <th className="hidden md:table-cell" style={{ width: '8rem' }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((issue) => (
                  <tr key={issue.id}>
                    <td>
                      <Link
                        to={`/issues/${issue.id}`}
                        className="font-mono text-mono text-brand-primary hover:underline"
                      >
                        {shortId(issue.id)}
                      </Link>
                    </td>
                    <td className="font-medium text-text-primary">{issue.title}</td>
                    <td className="hidden sm:table-cell text-text-secondary">{issue.category}</td>
                    <td><StatusDot value={issue.status} type="status" /></td>
                    <td className="hidden md:table-cell font-mono text-mono text-text-secondary">
                      {fmtDate(issue.createdAt)}
                    </td>
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
