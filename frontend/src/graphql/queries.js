import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
    }
  }
`;

export const ISSUES_QUERY = gql`
  query Issues($filter: IssueFilter) {
    issues(filter: $filter) {
      id
      title
      description
      category
      status
      priority
      imageUrl
      location {
        address
        lat
        lng
      }
      reportedBy {
        id
        name
        role
      }
      assignedTo {
        id
        name
      }
      upvoteCount
      upvotedByMe
      aiSuggestedCategory
      aiSuggestedPriority
      createdAt
    }
  }
`;

export const DASHBOARD_SUMMARY_QUERY = gql`
  query DashboardSummary {
    dashboardSummary {
      total
      open
      inProgress
      resolved
      urgent
      byCategory {
        category
        count
      }
      byStatus {
        status
        count
      }
      aiTrendInsights
    }
  }
`;

export const ISSUE_DETAIL_QUERY = gql`
  query Issue($id: ID!) {
    issue(id: $id) {
      id
      title
      description
      category
      status
      priority
      imageUrl
      location { address lat lng }
      upvoteCount
      upvotedByMe
      reportedBy { id name role }
      assignedTo { id name }
      aiSuggestedCategory
      aiSuggestedPriority
      aiSummary
      createdAt
      comments {
        id
        body
        createdAt
        author { id name }
      }
    }
  }
`;

export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications {
    myNotifications {
      id
      type
      message
      read
      createdAt
      issue {
        id
        title
      }
    }
  }
`;
