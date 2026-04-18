const Issue = require('../../models/Issue');
const User = require('../../models/User');
const Comment = require('../../models/Comment');
const Notification = require('../../models/Notification');
const { requireAuth, requireRole } = require('../../utils/auth');
const { toUser } = require('../auth-service/resolvers');
const { classifyIssue } = require('../ai-service/gemini');

const toIssue = (i) => ({
  id: i._id.toString(),
  title: i.title,
  description: i.description,
  category: i.category,
  location: i.location || { address: '', lat: null, lng: null },
  imageUrl: i.imageUrl || '',
  status: i.status,
  priority: i.priority,
  reportedBy: i.reportedBy, // resolved by field resolver
  assignedTo: i.assignedTo, // resolved by field resolver
  aiSummary: i.aiSummary || '',
  aiSuggestedCategory: i.aiSuggestedCategory || '',
  aiSuggestedPriority: i.aiSuggestedPriority || '',
  createdAt: i.createdAt.toISOString(),
  updatedAt: i.updatedAt.toISOString(),
  _id: i._id,
});

const toComment = (c) => ({
  id: c._id.toString(),
  body: c.body,
  author: c.author,
  createdAt: c.createdAt.toISOString(),
});

const toNotification = (n) => ({
  id: n._id.toString(),
  type: n.type,
  message: n.message,
  read: n.read,
  issue: n.issue,
  createdAt: n.createdAt.toISOString(),
});

const resolvers = {
  Query: {
    issues: async (_, { filter = {} }, ctx) => {
      requireAuth(ctx);
      const q = {};
      if (filter.status) q.status = filter.status;
      if (filter.category) q.category = filter.category;
      if (filter.priority) q.priority = filter.priority;
      if (filter.mineOnly) q.reportedBy = ctx.user.sub;
      const list = await Issue.find(q).sort({ createdAt: -1 });
      return list.map(toIssue);
    },
    issue: async (_, { id }, ctx) => {
      requireAuth(ctx);
      const i = await Issue.findById(id);
      return i ? toIssue(i) : null;
    },
    myNotifications: async (_, __, ctx) => {
      const user = requireAuth(ctx);
      const list = await Notification.find({ user: user.sub }).sort({ createdAt: -1 }).limit(50);
      return list.map(toNotification);
    },
  },
  Mutation: {
    reportIssue: async (_, args, ctx) => {
      const user = requireAuth(ctx);
      let { title, description, category, location, imageUrl, useAiCategorization } = args;

      let aiSuggestedCategory = '';
      let aiSuggestedPriority = '';

      // AI categorization: if requested OR no category provided, ask Gemini for a suggestion.
      if (useAiCategorization || !category) {
        try {
          const ai = await classifyIssue({ title, description });
          aiSuggestedCategory = ai.category;
          aiSuggestedPriority = ai.priority;
          if (!category) category = ai.category;
        } catch (err) {
          console.warn('[ai] classification failed, falling back to OTHER:', err.message);
          if (!category) category = 'OTHER';
        }
      }

      const issue = await Issue.create({
        title,
        description,
        category,
        location: location || {},
        imageUrl: imageUrl || '',
        reportedBy: user.sub,
        priority: aiSuggestedPriority || 'MEDIUM',
        aiSuggestedCategory,
        aiSuggestedPriority,
      });

      // Urgent-alert notification fan-out to staff.
      if (issue.priority === 'URGENT') {
        const staff = await User.find({ role: 'STAFF' }).select('_id');
        await Notification.insertMany(
          staff.map((s) => ({
            user: s._id,
            issue: issue._id,
            type: 'URGENT_ALERT',
            message: `Urgent issue reported: ${issue.title}`,
          }))
        );
      }

      return toIssue(issue);
    },

    updateIssueStatus: async (_, { id, status }, ctx) => {
      requireRole(ctx, 'STAFF');
      const issue = await Issue.findByIdAndUpdate(id, { status }, { new: true });
      if (issue) {
        await Notification.create({
          user: issue.reportedBy,
          issue: issue._id,
          type: 'STATUS_UPDATE',
          message: `Your issue "${issue.title}" is now ${status}.`,
        });
      }
      return toIssue(issue);
    },

    assignIssue: async (_, { id, userId }, ctx) => {
      requireRole(ctx, 'STAFF');
      const issue = await Issue.findByIdAndUpdate(id, { assignedTo: userId }, { new: true });
      if (issue) {
        await Notification.create({
          user: userId,
          issue: issue._id,
          type: 'ASSIGNMENT',
          message: `You have been assigned to: ${issue.title}`,
        });
      }
      return toIssue(issue);
    },

    updateIssuePriority: async (_, { id, priority }, ctx) => {
      requireRole(ctx, 'STAFF');
      const issue = await Issue.findByIdAndUpdate(id, { priority }, { new: true });
      return toIssue(issue);
    },

    addComment: async (_, { issueId, body }, ctx) => {
      const user = requireAuth(ctx);
      const c = await Comment.create({ issue: issueId, author: user.sub, body });
      return toComment(c);
    },

    markNotificationRead: async (_, { id }, ctx) => {
      const user = requireAuth(ctx);
      const n = await Notification.findOneAndUpdate(
        { _id: id, user: user.sub },
        { read: true },
        { new: true }
      );
      return toNotification(n);
    },
  },

  Issue: {
    reportedBy: async (issue) => {
      const u = await User.findById(issue.reportedBy);
      return u ? toUser(u) : null;
    },
    assignedTo: async (issue) => {
      if (!issue.assignedTo) return null;
      const u = await User.findById(issue.assignedTo);
      return u ? toUser(u) : null;
    },
    comments: async (issue) => {
      const list = await Comment.find({ issue: issue.id || issue._id }).sort({ createdAt: 1 });
      return list.map(toComment);
    },
  },

  Comment: {
    author: async (c) => {
      const u = await User.findById(c.author);
      return u ? toUser(u) : null;
    },
  },

  Notification: {
    issue: async (n) => {
      if (!n.issue) return null;
      const i = await Issue.findById(n.issue);
      return i ? toIssue(i) : null;
    },
  },
};

module.exports = { resolvers, toIssue };
