const { GraphQLError } = require('graphql');
const User = require('../../models/User');
const { signToken, requireAuth, requireRole } = require('../../utils/auth');

const toUser = (u) => ({
  id: u._id.toString(),
  name: u.name,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt ? u.createdAt.toISOString() : null,
});

const resolvers = {
  Query: {
    me: async (_, __, ctx) => {
      if (!ctx.user) return null;
      const u = await User.findById(ctx.user.sub);
      return u ? toUser(u) : null;
    },
    users: async (_, __, ctx) => {
      requireRole(ctx, 'STAFF');
      const list = await User.find().sort({ createdAt: -1 });
      return list.map(toUser);
    },
  },
  Mutation: {
    register: async (_, { name, email, password, role }) => {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        throw new GraphQLError('Email already registered', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      const passwordHash = await User.hashPassword(password);
      const user = await User.create({
        name,
        email,
        passwordHash,
        role: role || 'RESIDENT',
      });
      return { token: signToken(user), user: toUser(user) };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      const ok = await user.verifyPassword(password);
      if (!ok) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return { token: signToken(user), user: toUser(user) };
    },
  },
};

module.exports = { resolvers, toUser };
