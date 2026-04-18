const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');

const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

const getUserFromReq = (req) => {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) return null;
  return verifyToken(token);
};

const requireAuth = (ctx) => {
  if (!ctx.user) {
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return ctx.user;
};

const requireRole = (ctx, ...roles) => {
  const user = requireAuth(ctx);
  if (!roles.includes(user.role)) {
    throw new GraphQLError('Forbidden: insufficient role', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return user;
};

module.exports = { signToken, verifyToken, getUserFromReq, requireAuth, requireRole };
