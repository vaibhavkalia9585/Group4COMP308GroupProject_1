import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { ArrowLeft, ThumbsUp, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ISSUE_DETAIL_QUERY } from '../graphql/queries';
import { ADD_COMMENT_MUTATION, UPVOTE_ISSUE_MUTATION } from '../graphql/mutations';
import StatusDot from '../components/StatusDot';
import PageTitle from '../components/PageTitle';

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function IssueDetail() {
  const { id } = useParams();
  const [commentBody, setCommentBody] = useState('');

  const { data, loading, error } = useQuery(ISSUE_DETAIL_QUERY, { variables: { id } });
  const [upvoteIssue] = useMutation(UPVOTE_ISSUE_MUTATION, {
    refetchQueries: [{ query: ISSUE_DETAIL_QUERY, variables: { id } }],
  });
  const [addComment, { loading: commenting }] = useMutation(ADD_COMMENT_MUTATION, {
    refetchQueries: [{ query: ISSUE_DETAIL_QUERY, variables: { id } }],
  });

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    await addComment({ variables: { issueId: id, body: commentBody.trim() } });
    setCommentBody('');
  };

  if (loading) return <p className="text-ink-mute text-body">Loading…</p>;
  if (error) return <p className="text-flag text-body">Error: {error.message}</p>;

  const issue = data?.issue;
  if (!issue) return <p className="text-ink-mute text-body">Issue not found.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/my-issues" className="inline-flex items-center gap-1.5 text-body-sm text-ink-mute hover:text-ink mb-5">
        <ArrowLeft size={14} /> Back to my issues
      </Link>

      <PageTitle label={`CASE-${issue.id.slice(-8).toUpperCase()}`} title={issue.title} />

      {/* Meta panel */}
      <div className="panel p-5 mb-5 flex flex-wrap gap-4 text-body-sm">
        <div><span className="text-ink-mute">Status</span><br /><StatusDot type="status" value={issue.status} /></div>
        <div><span className="text-ink-mute">Priority</span><br /><StatusDot type="priority" value={issue.priority} /></div>
        <div><span className="text-ink-mute">Category</span><br /><span className="font-medium text-ink">{issue.category}</span></div>
        <div><span className="text-ink-mute">Reported by</span><br /><span className="font-medium text-ink">{issue.reportedBy?.name}</span></div>
        <div><span className="text-ink-mute">Date</span><br /><span className="font-medium text-ink">{fmt(issue.createdAt)}</span></div>
      </div>

      {/* Description */}
      <div className="panel p-5 mb-5">
        <p className="text-label uppercase tracking-widest font-medium text-ink-mute mb-2">Description</p>
        <p className="text-body text-ink whitespace-pre-wrap">{issue.description}</p>
        {issue.location?.address && (
          <p className="mt-3 text-body-sm text-ink-mute">📍 {issue.location.address}</p>
        )}
        {issue.imageUrl && (
          <img src={issue.imageUrl} alt="Issue" className="mt-4 rounded-lg max-h-64 object-cover w-full" />
        )}
      </div>

      {/* AI summary */}
      {issue.aiSummary && (
        <div className="panel p-5 mb-5 bg-paper-dim">
          <p className="text-label uppercase tracking-widest font-medium text-ink-mute mb-2">AI Summary</p>
          <p className="text-body text-ink">{issue.aiSummary}</p>
        </div>
      )}

      {/* Upvote */}
      <div className="panel p-5 mb-5 flex items-center gap-4">
        <motion.button
          onClick={() => upvoteIssue({ variables: { id } })}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-body-sm font-medium transition-colors ${
            issue.upvotedByMe
              ? 'border-civic bg-civic text-white'
              : 'border-rule bg-paper text-ink hover:border-civic hover:text-civic'
          }`}
        >
          <motion.span
            animate={issue.upvotedByMe ? { rotate: [0, -20, 10, 0] } : { rotate: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'inline-flex' }}
          >
            <ThumbsUp size={15} strokeWidth={2} />
          </motion.span>
          {issue.upvotedByMe ? 'Upvoted' : 'Upvote'}
        </motion.button>
        <AnimatePresence mode="wait">
          <motion.span
            key={issue.upvoteCount}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="text-body-sm text-ink-mute"
          >
            {issue.upvoteCount} {issue.upvoteCount === 1 ? 'upvote' : 'upvotes'}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Comments */}
      <div className="panel p-5 mb-5">
        <p className="text-label uppercase tracking-widest font-medium text-ink-mute mb-4">
          Comments ({issue.comments.length})
        </p>

        {issue.comments.length === 0 && (
          <p className="text-body-sm text-ink-mute mb-4">No comments yet. Be the first.</p>
        )}

        <div className="flex flex-col gap-3 mb-5">
          {issue.comments.map((c) => (
            <div key={c.id} className="rounded-lg bg-paper-dim p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-body-sm text-ink">{c.author?.name}</span>
                <span className="text-ink-faint text-mono text-mono">{fmt(c.createdAt)}</span>
              </div>
              <p className="text-body text-ink-soft">{c.body}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submitComment} className="flex gap-2">
          <input
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Add a comment…"
            className="field-input flex-1"
            disabled={commenting}
          />
          <button type="submit" disabled={commenting || !commentBody.trim()} className="btn-ink">
            <Send size={14} strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
}
