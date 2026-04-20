import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { ThumbsUp, ExternalLink } from 'lucide-react';
import { ISSUES_QUERY } from '../graphql/queries';
import PageTitle from '../components/PageTitle';
import StatusDot from '../components/StatusDot';

const CATEGORIES = ['', 'POTHOLE', 'STREETLIGHT', 'FLOODING', 'SAFETY', 'GARBAGE', 'NOISE', 'GRAFFITI', 'OTHER'];
const STATUSES   = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function IssuesList() {
  const [statusFilter,   setStatusFilter]   = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filter = {};
  if (statusFilter)   filter.status   = statusFilter;
  if (categoryFilter) filter.category = categoryFilter;

  const { data, loading } = useQuery(ISSUES_QUERY, {
    variables: { filter },
    fetchPolicy: 'cache-and-network',
  });

  const issues = data?.issues ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle label="Community" title="All issues">
        Browse every reported issue. Click an issue to view details, leave a comment, or upvote it.
      </PageTitle>

      {/* Filters — pills on desktop, selects on mobile */}
      <div className="panel p-4 mb-6">
        {/* Mobile: dropdowns */}
        <div className="flex gap-3 sm:hidden">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="field-input flex-1"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === '' ? 'All statuses' : s === 'IN_PROGRESS' ? 'In progress' : s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="field-input flex-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === '' ? 'All categories' : c.charAt(0) + c.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        {/* Desktop: pills */}
        <div className="hidden sm:flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => {
              const label = s === '' ? 'All statuses' : s === 'IN_PROGRESS' ? 'In progress' : s.charAt(0) + s.slice(1).toLowerCase();
              return (
                <button key={s} onClick={() => setStatusFilter(s)} className={`pill ${statusFilter === s ? 'pill-active' : ''}`}>
                  {label}
                </button>
              );
            })}
          </div>
          <div className="h-4 w-px bg-rule" />
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => {
              const label = c === '' ? 'All categories' : c.charAt(0) + c.slice(1).toLowerCase();
              return (
                <button key={c} onClick={() => setCategoryFilter(c)} className={`pill ${categoryFilter === c ? 'pill-active' : ''}`}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Issue cards */}
      {loading && <p className="text-body-sm text-ink-mute">Loading…</p>}

      {!loading && issues.length === 0 && (
        <div className="panel p-8 text-center">
          <p className="text-body text-ink-mute">No issues match these filters.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {issues.map((issue) => (
          <Link
            key={issue.id}
            to={`/issues/${issue.id}`}
            className="panel p-4 flex items-start gap-4 hover:border-civic/40 transition-colors group"
          >
            {/* Priority dot */}
            <div className="pt-0.5 shrink-0">
              <StatusDot type="priority" value={issue.priority} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink text-body group-hover:text-civic transition-colors truncate">
                {issue.title}
              </p>
              <p className="text-body-sm text-ink-mute mt-0.5 truncate">
                {issue.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-mono text-ink-faint">
                <span>{issue.category}</span>
                <span>·</span>
                <span>{fmt(issue.createdAt)}</span>
                {issue.location?.address && (
                  <>
                    <span>·</span>
                    <span className="truncate max-w-[160px]">📍 {issue.location.address}</span>
                  </>
                )}
              </div>
            </div>

            {/* Right side: status + upvotes + arrow */}
            <div className="shrink-0 flex flex-col items-end gap-2">
              <StatusDot type="status" value={issue.status} />
              <span className="inline-flex items-center gap-1 text-body-sm text-ink-mute">
                <ThumbsUp size={12} strokeWidth={2} />
                {issue.upvoteCount ?? 0}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {issues.length > 0 && (
        <p className="mt-4 text-center text-body-sm text-ink-faint">{issues.length} issue{issues.length !== 1 ? 's' : ''} shown</p>
      )}
    </div>
  );
}
