const gql = require('graphql-tag');

const typeDefs = gql`
  enum Role {
    RESIDENT
    STAFF
    ADVOCATE
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    createdAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Query {
    me: User
    users: [User!]!
  }

  extend type Mutation {
    register(name: String!, email: String!, password: String!, role: Role): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;

module.exports = typeDefs;
