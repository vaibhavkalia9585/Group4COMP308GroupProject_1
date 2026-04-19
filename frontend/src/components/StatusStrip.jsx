import { useQuery } from '@apollo/client';
import { DASHBOARD_SUMMARY_QUERY } from '../graphql/queries';

export default function StatusStrip() {
  const { data } = useQuery(DASHBOARD_SUMMARY_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const s = data?.dashboardSummary;

  if (!s) return null;

  return (
    <div className="border-b border-ui-border bg-blue-50">
      <div className="mx-auto flex max-w-content items-center gap-4 px-6 py-1.5 text-body-sm">
        <span className="text-text-secondary">
          <span className="font-semibold text-brand-primary">{s.open}</span> open
        </span>
        <span className="text-ui-border">·</span>
        <span className="text-text-secondary">
          <span className="font-semibold text-brand-primary">{s.resolved}</span> resolved
        </span>
        <span className="text-ui-border">·</span>
        {s.urgent > 0 ? (
          <span className="font-semibold text-brand-accent">
            {s.urgent} urgent alert{s.urgent !== 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-text-secondary">no urgent alerts</span>
        )}
      </div>
    </div>
  );
}
