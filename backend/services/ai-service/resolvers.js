const Issue = require('../../models/Issue');
const Comment = require('../../models/Comment');
const { requireAuth } = require('../../utils/auth');
const { summarizeIssue, generateTrendInsights } = require('./gemini');
const { chat } = require('./chatbot');

const resolvers = {
  Query: {
    dashboardSummary: async (_, __, ctx) => {
      requireAuth(ctx);
      const [total, open, inProgress, resolved, urgent, byCategoryRaw, byStatusRaw, recent] =
        await Promise.all([
          Issue.countDocuments({}),
          Issue.countDocuments({ status: 'OPEN' }),
          Issue.countDocuments({ status: 'IN_PROGRESS' }),
          Issue.countDocuments({ status: 'RESOLVED' }),
          Issue.countDocuments({ priority: 'URGENT', status: { $ne: 'RESOLVED' } }),
          Issue.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }]),
          Issue.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
          Issue.find().sort({ createdAt: -1 }).limit(100),
        ]);

      const aiTrendInsights = await generateTrendInsights(recent);

      return {
        total,
        open,
        inProgress,
        resolved,
        urgent,
        byCategory: byCategoryRaw.map((r) => ({ category: r._id, count: r.n })),
        byStatus: byStatusRaw.map((r) => ({ status: r._id, count: r.n })),
        aiTrendInsights,
      };
    },

    summarizeIssueById: async (_, { id }, ctx) => {
      requireAuth(ctx);
      const issue = await Issue.findById(id);
      if (!issue) return 'Issue not found.';
      const comments = await Comment.find({ issue: id }).sort({ createdAt: 1 });
      return summarizeIssue({
        title: issue.title,
        description: issue.description,
        comments: comments.map((c) => c.body),
      });
    },
  },

  Mutation: {
    chat: async (_, { message, history = [] }, ctx) => {
      requireAuth(ctx);
      return chat({ message, history });
    },
  },
};

module.exports = { resolvers };
