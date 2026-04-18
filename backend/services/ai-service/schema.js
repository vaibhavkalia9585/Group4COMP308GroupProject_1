const gql = require('graphql-tag');

const typeDefs = gql`
  type CategoryCount {
    category: String!
    count: Int!
  }

  type StatusCount {
    status: String!
    count: Int!
  }

  type DashboardSummary {
    total: Int!
    open: Int!
    inProgress: Int!
    resolved: Int!
    urgent: Int!
    byCategory: [CategoryCount!]!
    byStatus: [StatusCount!]!
    aiTrendInsights: String!
  }

  type ChatMessage {
    role: String!
    content: String!
  }

  input ChatHistoryInput {
    role: String!
    content: String!
  }

  type ChatReply {
    reply: String!
    source: String!
  }

  extend type Query {
    dashboardSummary: DashboardSummary!
    summarizeIssueById(id: ID!): String!
  }

  extend type Mutation {
    chat(message: String!, history: [ChatHistoryInput!]): ChatReply!
  }
`;

module.exports = typeDefs;
