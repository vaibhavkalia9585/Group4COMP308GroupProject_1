import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { ThumbsUp, ExternalLink } from 'lucide-react';
import { DASHBOARD_SUMMARY_QUERY, ISSUES_QUERY } from '../graphql/queries';
import { UPDATE_ISSUE_PRIORITY_MUTATION, UPDATE_ISSUE_STATUS_MUTATION } from '../graphql/mutations';
import PageTitle from '../components/PageTitle';
import SparkStat from '../components/SparkStat';
import StatusDot from '../components/StatusDot';
import InlineEdit from '../components/InlineEdit';
import IssueMap from '../components/IssueMap';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

function fmtDate(ts) {
  return new Date(Number(ts) || ts).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function shortId(id) {
  return `CASE-${id?.slice(-8).toUpperCase()}`;
}

function makeSpark(total, seed) {
  return Array.from({ length: 7 }, (_, i) => ({
    v: Math.max(0, Math.round((total ?? 0) * (0.6 + 0.4 * Math.sin(i * seed + seed)))),
  }));
}

export default function StaffDashboard() {
  const [statusFilter, setStatusFilter] = useState('');
  const filter = statusFilter ? { status: statusFilter } : {};

  const { data: sumData, loading: sumLoading } = useQuery(DASHBOARD_SUMMARY_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: issuesData, refetch } = useQuery(ISSUES_QUERY, {
    variables: { filter },
    fetchPolicy: 'cache-and-network',
  });

  const [updateStatus] = useMutation(UPDATE_ISSUE_STATUS_MUTATION);
  const [updatePriority] = useMutation(UPDATE_ISSUE_PRIORITY_MUTATION);

  const setStatus = async (id, status) => {
    await updateStatus({ variables: { id, status } });
    refetch();
  };

  const setPriority = async (id, priority) => {
    await updatePriority({ variables: { id, priority } });
    refetch();
  };

  const s = sumData?.dashboardSummary;

  return (
    <div>
      <PageTitle label="Municipal staff" title="Dashboard" />

      {/* Issue heatmap */}
      <div className="mb-8">
        <p className="text-label uppercase tracking-widest font-medium text-ink-mute mb-3">Issue map</p>
        <IssueMap issues={issuesData?.issues ?? []} />
      </div>

      <div className="mb-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        <SparkStat title="Total" value={s?.total} data={makeSpark(s?.total, 1.1)} loading={sumLoading} />
        <SparkStat title="Open" value={s?.open} data={makeSpark(s?.open, 2.3)} loading={sumLoading} />
        <SparkStat title="In progress" value={s?.inProgress} data={makeSpark(s?.inProgress, 3.7)} loading={sumLoading} />
        <SparkStat title="Resolved" value={s?.resolved} data={makeSpark(s?.resolved, 4.1)} loading={sumLoading} />
        <SparkStat title="Urgent" value={s?.urgent} data={makeSpark(s?.urgent, 5.9)} loading={sumLoading} />
      </div>

      <div className="panel mb-10 p-6">
        <h2 className="mb-3 text-display-md font-semibold text-text-primary">
          What&apos;s happening this week
        </h2>
        <p className="whitespace-pre-wrap text-body text-text-secondary">
          {sumLoading ? 'Analysing recent reports…' : s?.aiTrendInsights || 'No trend data available yet.'}
        </p>
        {s?.byCategory?.length > 0 && (
          <div className="mt-5 border-t border-ui-border pt-5">
            <p className="mb-3 font-mono text-label font-medium uppercase tracking-widest text-text-secondary">
              By category
            </p>
            <div className="flex flex-wrap gap-2">
              {s.byCategory.map((c) => (
                <span key={c.category} className="badge">
                  <span className="font-semibold text-brand-primary">{c.count}</span>
                  {c.category.toLowerCase()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="panel p-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="mr-2 font-mono text-label font-medium uppercase tracking-widest text-text-secondary">
            Filter
          </span>
          {['', ...STATUSES].map((status) => {
            const label = status === '' ? 'All' : status === 'IN_PROGRESS'
              ? 'In progress'
              : status.charAt(0) + status.slice(1).toLowerCase();
            const active = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`pill ${active ? 'pill-active' : ''}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {issuesData?.issues?.length === 0 && (
          <p className="py-6 text-body text-text-secondary">No issues match this filter.</p>
        )}

        {(issuesData?.issues?.length ?? 0) > 0 && (
          <div className="overflow-x-auto rounded-xl border border-ui-border bg-ui-surface">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '11rem' }}>Ref</th>
                  <th>Title</th>
                  <th style={{ width: '9rem' }}>Category</th>
                  <th style={{ width: '9rem' }}>Priority</th>
                  <th style={{ width: '9rem' }}>Status</th>
                  <th style={{ width: '9rem' }}>Reporter</th>
                  <th style={{ width: '9rem' }}>Submitted</th>
                  <th style={{ width: '6rem' }}>Upvotes</th>
                  <th style={{ width: '5rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {issuesData.issues.map((issue) => (
                  <tr key={issue.id}>
                    <td><span className="font-mono text-mono text-brand-primary">{shortId(issue.id)}</span></td>
                    <td className="font-medium text-text-primary">{issue.title}</td>
                    <td className="text-text-secondary">{issue.category}</td>
                    <td>
                      <InlineEdit
                        value={issue.priority}
                        options={PRIORITIES}
                        onSave={(v) => setPriority(issue.id, v)}
                        renderValue={(v) => <StatusDot value={v} type="priority" />}
                      />
                    </td>
                    <td>
                      <InlineEdit
                        value={issue.status}
                        options={STATUSES}
                        onSave={(v) => setStatus(issue.id, v)}
                        renderValue={(v) => <StatusDot value={v} type="status" />}
                      />
                    </td>
                    <td className="text-text-secondary">{issue.reportedBy?.name ?? '—'}</td>
                    <td className="font-mono text-mono text-text-secondary">{fmtDate(issue.createdAt)}</td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-body-sm text-ink-mute">
                        <ThumbsUp size={12} strokeWidth={2} />
                        {issue.upvoteCount ?? 0}
                      </span>
                    </td>
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
    </div>
  );
}
