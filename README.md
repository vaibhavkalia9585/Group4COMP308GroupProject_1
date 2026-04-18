# CivicCase — AI-Powered Local Issue Tracker

**Group 4 · COMP308 Group Project (Software Engineering Technology stream)**

An AI-driven web app that helps residents of a Canadian municipality **report, track,
and resolve local community issues** — potholes, broken streetlights, flooding, and
safety hazards — with AI-assisted categorization, trend insights, and an agentic
chatbot.

---

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19 (functional components), React Router, Apollo Client, Tailwind CSS, Vite |
| Backend | Node.js + Express.js, Apollo Server (GraphQL) |
| Database | MongoDB + Mongoose |
| Auth | JWT (`jsonwebtoken` + `bcryptjs`) |
| AI | Google Gemini API (`@google/generative-ai`) |
| Agentic Chatbot | LangGraph + Gemini (`@langchain/langgraph`, `@langchain/google-genai`) |

### Microservice-style backend organization

The backend is a single Express/Apollo app whose GraphQL schema is composed from
three logical services:

```
backend/services/
  ├── auth-service/    # registration, login, JWT, roles
  ├── issue-service/   # issue CRUD, assignment, notifications
  └── ai-service/      # Gemini classifier, summarizer, trend insights, LangGraph chatbot
```

Each service owns its own `schema.js` + `resolvers.js`. `server.js` merges them.

---

## Features (aligned with marking scheme)

- **User registration/login using JWT** — `RESIDENT`, `STAFF`, `ADVOCATE` roles.
- **Issue Reporting & AI Categorization** — residents submit issues with geotag and
  photo URL; Gemini picks a category and priority.
- **Notifications & Alerts** — residents get status updates on their issues; staff
  receive urgent-priority fan-out alerts.
- **Issue Management Dashboard** — staff filter, re-assign, change status/priority.
- **Agentic Chatbot (LangGraph + Gemini)** — router → tool executor graph that
  answers natural-language questions about open/resolved issues, safety alerts,
  and trends.
- **Analytics & AI Insights** — counts by status/category, Gemini-generated trend
  paragraph.
- **MongoDB document modeling** — `User`, `Issue`, `Notification`, `Comment`.
- **GraphQL API** — composed across the three services.
- **Responsive UI** — Tailwind CSS.

---

## Project layout

```
Group4COMP308GroupProject_1/
├── backend/
│   ├── config/db.js
│   ├── models/          # User.js, Issue.js, Notification.js, Comment.js
│   ├── services/
│   │   ├── auth-service/
│   │   ├── issue-service/
│   │   └── ai-service/  # gemini.js + chatbot.js (LangGraph)
│   ├── utils/auth.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── apollo/client.js
│   │   ├── components/  # Navbar, ProtectedRoute, IssueCard
│   │   ├── context/AuthContext.jsx
│   │   ├── graphql/     # queries.js, mutations.js
│   │   ├── pages/       # Home, Login, Register, ReportIssue, MyIssues, StaffDashboard, Chatbot
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB running locally (or an Atlas connection string)
- A Google Gemini API key (optional — the app works in heuristic fallback mode without one)

### 1. Backend

```bash
cd backend
cp .env.example .env      # then edit values
npm install
npm run dev               # or: npm start
```

The GraphQL API is served at **http://localhost:4000/graphql**.

#### Required environment variables (`backend/.env`)

| Var | Purpose |
| --- | --- |
| `PORT` | Backend port (default 4000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `GEMINI_API_KEY` | Google Gemini API key (optional for demo) |
| `GEMINI_MODEL` | Model id, defaults to `gemini-1.5-flash` |
| `CLIENT_ORIGIN` | Frontend origin for CORS, default `http://localhost:5173` |

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The React app runs at **http://localhost:5173**.

#### Required environment variables (`frontend/.env`)

| Var | Purpose |
| --- | --- |
| `VITE_GRAPHQL_URL` | Backend GraphQL URL, default `http://localhost:4000/graphql` |

---

## Demo flow (for presentation)

1. **Register** two users: one `RESIDENT` and one `STAFF`.
2. As the resident: **Report an Issue** — leave category blank so Gemini classifies it.
3. Switch to the staff user: open the **Staff Dashboard** — see counts, AI trend
   insights, filter by status, change status/priority.
4. Open the **Chatbot** — ask:
   - "How many issues are open?"
   - "Any urgent safety alerts?"
   - "What are the current trends?"
5. Back as the resident: open **My Issues** — notifications now show status updates.

---

## AI integration points

| Feature | Where | Function |
| --- | --- | --- |
| Classification | `backend/services/ai-service/gemini.js` | `classifyIssue(...)` — called by `reportIssue` mutation |
| Summarization | `backend/services/ai-service/gemini.js` | `summarizeIssue(...)` — exposed as `summarizeIssueById` query |
| Trend insights | `backend/services/ai-service/gemini.js` | `generateTrendInsights(...)` — feeds `dashboardSummary` |
| Agentic chatbot | `backend/services/ai-service/chatbot.js` | LangGraph router → tool-exec graph over issue data |

If `GEMINI_API_KEY` is not set, each AI function falls back to deterministic
heuristics so the demo still works offline.

---

## Notes on scope

This repository implements the **Software Engineering Technology Students** project
(Question 1) from the COMP308 Group Project requirements. It does **not** contain
any game-programming artifacts (no Three.js, no Cyber Heist, no leaderboards).
