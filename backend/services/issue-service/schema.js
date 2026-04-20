const gql = require('graphql-tag');

const typeDefs = gql`
  enum IssueCategory {
    POTHOLE
    STREETLIGHT
    FLOODING
    SAFETY
    GARBAGE
    NOISE
    GRAFFITI
    OTHER
  }

  enum IssueStatus {
    OPEN
    IN_PROGRESS
    RESOLVED
  }

  enum IssuePriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  type Location {
    address: String
    lat: Float
    lng: Float
  }

  input LocationInput {
    address: String
    lat: Float
    lng: Float
  }

  type Issue {
    id: ID!
    title: String!
    description: String!
    category: IssueCategory!
    location: Location
    imageUrl: String
    status: IssueStatus!
    priority: IssuePriority!
    reportedBy: User!
    assignedTo: User
    aiSummary: String
    aiSuggestedCategory: String
    aiSuggestedPriority: String
    comments: [Comment!]!
    upvoteCount: Int!
    upvotedByMe: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Comment {
    id: ID!
    body: String!
    author: User!
    createdAt: String!
  }

  type Notification {
    id: ID!
    type: String!
    message: String!
    read: Boolean!
    issue: Issue
    createdAt: String!
  }

  input IssueFilter {
    status: IssueStatus
    category: IssueCategory
    priority: IssuePriority
    mineOnly: Boolean
  }

  extend type Query {
    issues(filter: IssueFilter): [Issue!]!
    issue(id: ID!): Issue
    myNotifications: [Notification!]!
  }

  extend type Mutation {
    reportIssue(
      title: String!
      description: String!
      category: IssueCategory
      location: LocationInput
      imageUrl: String
      useAiCategorization: Boolean
    ): Issue!

    updateIssueStatus(id: ID!, status: IssueStatus!): Issue!
    assignIssue(id: ID!, userId: ID!): Issue!
    updateIssuePriority(id: ID!, priority: IssuePriority!): Issue!
    addComment(issueId: ID!, body: String!): Comment!
    upvoteIssue(id: ID!): Issue!
    markNotificationRead(id: ID!): Notification!
  }
`;

module.exports = typeDefs;
