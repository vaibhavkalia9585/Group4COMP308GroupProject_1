require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const gql = require('graphql-tag');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

const connectDB = require('./config/db');
const { getUserFromReq } = require('./utils/auth');

// Service typeDefs + resolvers (microservice-style organization)
const authTypeDefs = require('./services/auth-service/schema');
const { resolvers: authResolvers } = require('./services/auth-service/resolvers');

const issueTypeDefs = require('./services/issue-service/schema');
const { resolvers: issueResolvers } = require('./services/issue-service/resolvers');

const aiTypeDefs = require('./services/ai-service/schema');
const { resolvers: aiResolvers } = require('./services/ai-service/resolvers');

// Root type placeholders so each service's `extend type Query/Mutation` works.
const rootTypeDefs = gql`
  type Query {
    _health: String
  }
  type Mutation {
    _noop: String
  }
`;

const rootResolvers = {
  Query: { _health: () => 'ok' },
  Mutation: { _noop: () => 'ok' },
};

// Merge resolver maps by simple deep-merge of top-level keys.
const mergeResolvers = (...maps) => {
  const out = {};
  for (const m of maps) {
    for (const key of Object.keys(m)) {
      out[key] = { ...(out[key] || {}), ...m[key] };
    }
  }
  return out;
};

async function start() {
  await connectDB();

  const apollo = new ApolloServer({
    typeDefs: [rootTypeDefs, authTypeDefs, issueTypeDefs, aiTypeDefs],
    resolvers: mergeResolvers(rootResolvers, authResolvers, issueResolvers, aiResolvers),
  });
  await apollo.start();

  const app = express();
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(bodyParser.json({ limit: '2mb' }));

  app.get('/', (_, res) => res.json({ service: 'CivicCase API', status: 'ok' }));

  app.use(
    '/graphql',
    expressMiddleware(apollo, {
      context: async ({ req }) => ({ user: getUserFromReq(req) }),
    })
  );

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`[server] CivicCase API ready at http://localhost:${port}/graphql`);
  });
}

start().catch((err) => {
  console.error('[server] fatal:', err);
  process.exit(1);
});
