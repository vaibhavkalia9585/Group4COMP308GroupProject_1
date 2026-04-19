import StatusDot from './StatusDot';

export default function IssueRow({ issue }) {
  return (
    <tr>
      <td className="font-mono text-mono text-brand-primary">{issue.id?.slice(-6).toUpperCase()}</td>
      <td className="font-medium text-text-primary">{issue.title}</td>
      <td className="text-text-secondary">{issue.category}</td>
      <td><StatusDot value={issue.status} type="status" /></td>
      <td><StatusDot value={issue.priority} type="priority" /></td>
    </tr>
  );
}
