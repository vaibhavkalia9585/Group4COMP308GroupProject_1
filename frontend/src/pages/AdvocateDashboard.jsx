import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Users } from 'lucide-react';
import { ISSUES_QUERY } from '../graphql/queries';
import PageTitle from '../components/PageTitle';
import StatusDot from '../components/StatusDot';

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdvocateDashboard() {
  const { data, loading } = useQuery(ISSUES_QUERY, {
    variables: { filter: { status: 'OPEN' } },
    fetchPolicy: 'cache-and-network',
  });

  const issues = data?.issues ?? [];

  // Sort by upvote count descending for community priority view
  const sorted = [...issues].sort((a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0));
  const urgent = issues.filter((i) => i.priority === 'URGENT');

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle label="Community Advocate" title="Engagement Hub">
        Monitor community-reported issues, track upvotes, and support residents in your neighbourhood.
      </PageTitle>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="panel p-4 text-center">
          <p className="text-display-md font-semibold text-ink">{issues.length}</p>
          <p className="text-body-sm text-ink-mute mt-0.5">Open issues</p>
        </div>
        <div className="panel p-4 text-center">
          <p className="text-display-md font-semibold text-flag">{urgent.length}</p>
          <p className="text-body-sm text-ink-mute mt-0.5">Urgent alerts</p>
        </div>
        <div className="panel p-4 text-center">
          <p className="text-display-md font-semibold text-moss">
            {issues.reduce((s, i) => s + (i.upvoteCount ?? 0), 0)}
          </p>
          <p className="text-body-sm text-ink-mute mt-0.5">Total upvotes</p>
        </div>
      </div>

      {/* Urgent alerts */}
      {urgent.length > 0 && (
        <div className="panel p-5 mb-5 border-flag/40 bg-flag-soft">
          <p className="text-label uppercase tracking-widest font-semibold text-flag mb-3">
            Urgent alerts
          </p>
          <div className="flex flex-col gap-2">
            {urgent.map((i) => (
              <Link
                key={i.id}
                to={`/issues/${i.id}`}
                className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2 hover:bg-white transition-colors"
              >
                <span className="text-body-sm font-medium text-ink">{i.title}</span>
                <span className="text-body-sm text-ink-mute">{fmt(i.createdAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Community priority — most upvoted */}
      <div className="panel p-5 mb-5">
        <p className="text-label uppercase tracking-widest font-medium text-ink-mute mb-4 flex items-center gap-2">
          <ThumbsUp size={13} /> Most upvoted open issues
        </p>
        {loading && <p className="text-body-sm text-ink-mute">Loading…</p>}
        {!loading && sorted.length === 0 && (
          <p className="text-body-sm text-ink-mute">No open issues right now.</p>
        )}
        <div className="flex flex-col divide-y divide-rule">
          {sorted.slice(0, 10).map((issue) => (
            <Link
              key={issue.id}
              to={`/issues/${issue.id}`}
              className="flex items-center gap-3 py-3 hover:bg-paper-dim -mx-5 px-5 transition-colors"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dim text-body-sm font-semibold text-civic shrink-0">
                {issue.upvoteCount ?? 0}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-medium text-ink truncate">{issue.title}</p>
                <p className="text-mono text-ink-faint">{issue.category} · {fmt(issue.createdAt)}</p>
              </div>
              <StatusDot type="priority" value={issue.priority} />
            </Link>
          ))}
        </div>
      </div>

      {/* Engagement tips */}
      <div className="panel p-5">
        <p className="text-label uppercase tracking-widest font-medium text-ink-mute mb-3 flex items-center gap-2">
          <Users size={13} /> Community coordination
        </p>
        <ul className="flex flex-col gap-2 text-body-sm text-ink-soft">
          <li className="flex items-start gap-2">
            <ThumbsUp size={13} className="mt-0.5 shrink-0 text-civic" />
            Upvote issues to signal community priority to city staff.
          </li>
          <li className="flex items-start gap-2">
            <MessageCircle size={13} className="mt-0.5 shrink-0 text-civic" />
            Add comments to issues to provide additional context or updates.
          </li>
          <li className="flex items-start gap-2">
            <Users size={13} className="mt-0.5 shrink-0 text-civic" />
            Share issue reference numbers (CASE-XXXXXXXX) with neighbours so they can upvote together.
          </li>
        </ul>
      </div>
    </div>
  );
}
