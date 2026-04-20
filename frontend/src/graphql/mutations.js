import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!, $role: Role) {
    register(name: $name, email: $email, password: $password, role: $role) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const REPORT_ISSUE_MUTATION = gql`
  mutation ReportIssue(
    $title: String!
    $description: String!
    $category: IssueCategory
    $location: LocationInput
    $imageUrl: String
    $useAiCategorization: Boolean
  ) {
    reportIssue(
      title: $title
      description: $description
      category: $category
      location: $location
      imageUrl: $imageUrl
      useAiCategorization: $useAiCategorization
    ) {
      id
      title
      category
      priority
      status
      aiSuggestedCategory
      aiSuggestedPriority
    }
  }
`;

export const UPDATE_ISSUE_STATUS_MUTATION = gql`
  mutation UpdateIssueStatus($id: ID!, $status: IssueStatus!) {
    updateIssueStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const UPDATE_ISSUE_PRIORITY_MUTATION = gql`
  mutation UpdateIssuePriority($id: ID!, $priority: IssuePriority!) {
    updateIssuePriority(id: $id, priority: $priority) {
      id
      priority
    }
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      read
    }
  }
`;

export const ADD_COMMENT_MUTATION = gql`
  mutation AddComment($issueId: ID!, $body: String!) {
    addComment(issueId: $issueId, body: $body) {
      id
      body
      createdAt
      author {
        id
        name
      }
    }
  }
`;

export const UPVOTE_ISSUE_MUTATION = gql`
  mutation UpvoteIssue($id: ID!) {
    upvoteIssue(id: $id) {
      id
      upvoteCount
      upvotedByMe
    }
  }
`;

export const CHAT_MUTATION = gql`
  mutation Chat($message: String!, $history: [ChatHistoryInput!]) {
    chat(message: $message, history: $history) {
      reply
      source
    }
  }
`;
