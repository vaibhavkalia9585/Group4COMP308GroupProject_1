import { useQuery } from '@apollo/client';
import { DASHBOARD_SUMMARY_QUERY } from '../graphql/queries';

export default function StatusStrip() {
  const { data } = useQuery(DASHBOARD_SUMMARY_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const s = data?.dashboardSummary;

  return (
    <div className="border-b border-rule bg-paper-dim">
      <div className="mx-auto flex max-w-content items-center gap-4 px-6 py-1.5 text-body-sm">
        {s ? (
          <>
            <span className="text-ink-mute">
              <span className="font-semibold text-ink">{s.open}</span> open
            </span>
            <span className="text-rule">·</span>
            <span className="text-ink-mute">
              <span className="font-semibold text-ink">{s.resolved}</span> resolved
            </span>
            <span className="text-rule">·</span>
            {s.urgent > 0 ? (
              <span className="text-flag font-semibold">
                {s.urgent} urgent alert{s.urgent !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-ink-mute">no urgent alerts</span>
            )}
          </>
        ) : (
          <span className="text-ink-mute">Loading status…</span>
        )}
      </div>
    </div>
  );
}
