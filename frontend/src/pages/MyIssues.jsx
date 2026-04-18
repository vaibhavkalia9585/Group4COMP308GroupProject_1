import { useMutation, useQuery } from '@apollo/client';
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
  return 'CASE-' + id?.slice(-8).toUpperCase();
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

      <div className="panel p-6 mb-8">
        <h2 className="font-semibold text-ink text-display-md mb-4">Reports</h2>

        {loading && <p className="text-body text-ink-mute">Loading…</p>}
        {error && <p className="text-body text-flag">{error.message}</p>}

        {!loading && issues.length === 0 && (
          <p className="text-body text-ink-mute py-6">
            You haven't submitted any reports yet.
          </p>
        )}

        {issues.length > 0 && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '11rem' }}>Ref</th>
                  <th>Title</th>
                  <th style={{ width: '9rem' }}>Category</th>
                  <th style={{ width: '9rem' }}>Status</th>
                  <th style={{ width: '8rem' }}>Last update</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
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

      {/* Notifications */}
      <div className="panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-ink text-display-md">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-civic px-2 py-0.5 text-[11px] font-semibold text-white">
                {unreadCount} new
              </span>
            )}
          </h2>
        </div>

        {notifs.length === 0 && (
          <p className="text-body text-ink-mute py-4">No notifications yet.</p>
        )}

        <div className="flex flex-col gap-2">
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`${n.read ? 'notif-read' : 'notif-unread'} flex items-start justify-between gap-4`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-body ${n.read ? 'text-ink-mute' : 'text-ink font-medium'}`}>
                  {n.message}
                </p>
                <p className="font-mono text-mono text-ink-faint mt-1">
                  {n.type} · {fmtDate(n.createdAt)}
                </p>
              </div>
              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="btn-ghost shrink-0"
                  style={{ padding: '0.375rem 0.875rem', fontSize: '13px' }}
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
