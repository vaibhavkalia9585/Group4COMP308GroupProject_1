import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { DASHBOARD_SUMMARY_QUERY, ISSUES_QUERY } from '../graphql/queries';
import { UPDATE_ISSUE_PRIORITY_MUTATION, UPDATE_ISSUE_STATUS_MUTATION } from '../graphql/mutations';
import PageTitle from '../components/PageTitle';
import SparkStat from '../components/SparkStat';
import StatusDot from '../components/StatusDot';
import InlineEdit from '../components/InlineEdit';

const STATUSES   = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

function fmtDate(ts) {
  return new Date(Number(ts) || ts).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
function shortId(id) {
  return 'CASE-' + id?.slice(-8).toUpperCase();
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

  const [updateStatus]   = useMutation(UPDATE_ISSUE_STATUS_MUTATION);
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

      {/* Sparkline stats row */}
      <div className="mb-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        <SparkStat title="Total"       value={s?.total}      data={makeSpark(s?.total, 1.1)}      loading={sumLoading} />
        <SparkStat title="Open"        value={s?.open}       data={makeSpark(s?.open, 2.3)}       loading={sumLoading} />
        <SparkStat title="In progress" value={s?.inProgress} data={makeSpark(s?.inProgress, 3.7)} loading={sumLoading} />
        <SparkStat title="Resolved"    value={s?.resolved}   data={makeSpark(s?.resolved, 4.1)}   loading={sumLoading} />
        <SparkStat title="Urgent"      value={s?.urgent}     data={makeSpark(s?.urgent, 5.9)}     loading={sumLoading} />
      </div>

      {/* Trend narrative */}
      <div className="panel p-6 mb-10">
        <h2 className="font-semibold text-ink text-display-md mb-3">
          What's happening this week
        </h2>
        <p className="text-body text-ink-soft whitespace-pre-wrap">
          {sumLoading ? 'Analysing recent reports…' : s?.aiTrendInsights || 'No trend data available yet.'}
        </p>
        {s?.byCategory?.length > 0 && (
          <div className="mt-5 pt-5 border-t border-rule">
            <p className="text-label uppercase tracking-widest font-medium text-ink-mute mb-3">By category</p>
            <div className="flex flex-wrap gap-2">
              {s.byCategory.map((c) => (
                <span key={c.category} className="badge">
                  <span className="font-semibold text-ink">{c.count}</span>
                  {' '}{c.category.toLowerCase()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters + Issues table in one panel */}
      <div className="panel p-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-label uppercase tracking-widest font-medium text-ink-mute mr-2">Filter</span>
          {['', ...STATUSES].map((s) => {
            const label = s === '' ? 'All' : s === 'IN_PROGRESS' ? 'In progress' : s.charAt(0) + s.slice(1).toLowerCase();
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`pill ${active ? 'pill-active' : ''}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {issuesData?.issues?.length === 0 && (
          <p className="text-body text-ink-mute py-6">No issues match this filter.</p>
        )}

        {(issuesData?.issues?.length ?? 0) > 0 && (
        <div className="overflow-x-auto">
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
              </tr>
            </thead>
            <tbody>
              {issuesData.issues.map((issue) => (
                <tr key={issue.id}>
                  <td><span className="font-mono text-mono text-civic">{shortId(issue.id)}</span></td>
                  <td className="font-medium text-ink">{issue.title}</td>
                  <td className="text-ink-mute">{issue.category}</td>
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
                  <td className="text-ink-mute">{issue.reportedBy?.name ?? '—'}</td>
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
