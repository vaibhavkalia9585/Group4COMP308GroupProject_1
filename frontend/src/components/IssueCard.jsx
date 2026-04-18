import StatusDot from './StatusDot';

export default function IssueRow({ issue }) {
  return (
    <tr>
      <td className="font-mono text-mono text-civic">{issue.id?.slice(-6).toUpperCase()}</td>
      <td className="font-medium text-ink">{issue.title}</td>
      <td className="text-ink-mute">{issue.category}</td>
      <td><StatusDot value={issue.status} type="status" /></td>
      <td><StatusDot value={issue.priority} type="priority" /></td>
    </tr>
  );
}
