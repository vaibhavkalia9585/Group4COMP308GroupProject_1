import { useMutation, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, ExternalLink } from 'lucide-react';
import { ISSUES_QUERY, MY_NOTIFICATIONS_QUERY } from '../graphql/queries';
import { MARK_NOTIFICATION_READ_MUTATION } from '../graphql/mutations';
import PageTitle from '../components/PageTitle';
import StatusDot from '../components/StatusDot';

function fmtDate(ts) {
  return new Date(Number(ts) || ts).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function shortId(id) {
  return `CASE-${id?.slice(-8).toUpperCase()}`;
}

export default function MyIssues() {
  const { data, loading, error } = useQuery(ISSUES_QUERY, {
    variables: { filter: { mineOnly: true } },
    fetchPolicy: 'cache-and-network',
  });
  const { data: notifData, refetch: refetchNotifs } = useQuery(MY_NOTIFICATIONS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const [markRead] = useMutation(MARK_NOTIFICATION_READ_MUTATION);

  const handleMarkRead = async (id) => {
    await markRead({ variables: { id } });
    refetchNotifs();
  };

  const issues = data?.issues ?? [];
  const notifs = notifData?.myNotifications ?? [];
  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div>
      <PageTitle label="Your account" title="My reports" />

      <div className="panel mb-8 p-6">
        <h2 className="mb-4 text-display-md font-semibold text-text-primary">Reports</h2>

        {loading && <p className="text-body text-text-secondary">Loading…</p>}
        {error && <p className="text-body text-brand-accent">{error.message}</p>}

        {!loading && issues.length === 0 && (
          <p className="py-6 text-body text-text-secondary">
            You haven&apos;t submitted any reports yet.
          </p>
        )}

        {issues.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-ui-border bg-ui-surface">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="hidden sm:table-cell" style={{ width: '11rem' }}>Ref</th>
                  <th>Title</th>
                  <th className="hidden sm:table-cell" style={{ width: '9rem' }}>Category</th>
                  <th style={{ width: '9rem' }}>Status</th>
                  <th className="hidden md:table-cell" style={{ width: '7rem' }}>Upvotes</th>
                  <th className="hidden md:table-cell" style={{ width: '8rem' }}>Last update</th>
                  <th style={{ width: '5rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <td className="hidden sm:table-cell">
                      <span className="font-mono text-mono text-brand-primary">
                        {shortId(issue.id)}
                      </span>
                    </td>
                    <td className="font-medium text-text-primary max-w-[8rem] sm:max-w-none truncate">{issue.title}</td>
                    <td className="hidden sm:table-cell text-text-secondary">{issue.category}</td>
                    <td><StatusDot value={issue.status} type="status" /></td>
                    <td className="hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-body-sm text-ink-mute">
                        <ThumbsUp size={12} strokeWidth={2} />
                        {issue.upvoteCount ?? 0}
                      </span>
                    </td>
                    <td className="hidden md:table-cell font-mono text-mono text-text-secondary">{fmtDate(issue.createdAt)}</td>
                    <td>
                      <Link
                        to={`/issues/${issue.id}`}
                        className="inline-flex items-center gap-1 text-body-sm text-civic hover:underline"
                      >
                        View <ExternalLink size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-display-md font-semibold text-text-primary">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-brand-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                {unreadCount} new
              </span>
            )}
          </h2>
        </div>

        {notifs.length === 0 && (
          <p className="py-4 text-body text-text-secondary">No notifications yet.</p>
        )}

        <div className="flex flex-col gap-2">
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`${n.read ? 'notif-read' : 'notif-unread'} flex items-start justify-between gap-4`}
            >
              <div className="min-w-0 flex-1">
                <p className={`text-body ${n.read ? 'text-text-secondary' : 'font-medium text-text-primary'}`}>
                  {n.message}
                </p>
                <p className="mt-1 font-mono text-mono text-gray-400">
                  {n.type} · {fmtDate(n.createdAt)}
                </p>
              </div>
              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="btn-ghost shrink-0 px-3 py-1.5 text-[13px]"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
