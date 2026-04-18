/**
 * CivicCase smoke tests — runs against a live backend on localhost:4000
 * Usage: node smoke-tests.mjs
 */

const GQL = 'http://localhost:4000/graphql';

// ── helpers ─────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  ✅ ${label}`);
  passed++;
}
function fail(label, detail = '') {
  console.log(`  ❌ ${label}${detail ? ': ' + detail : ''}`);
  failed++;
}

async function gql(query, variables = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(GQL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

function section(title) {
  console.log(`\n── ${title} ${'─'.repeat(50 - title.length)}`);
}

// ── 1. Health check ──────────────────────────────────────────────────────────

section('Health Check');
{
  const res = await fetch('http://localhost:4000/');
  const json = await res.json();
  json.status === 'ok' ? ok('API health endpoint returns ok') : fail('Health check', JSON.stringify(json));
}

// ── 2. Auth ──────────────────────────────────────────────────────────────────

section('Auth — Register & Login');

const ts = Date.now();
const residentEmail = `resident_${ts}@test.com`;
const staffEmail    = `staff_${ts}@test.com`;

let residentToken, staffToken, residentId, staffId;

// Register resident
{
  const r = await gql(`
    mutation {
      register(name:"Test Resident", email:"${residentEmail}", password:"Pass1234!", role:RESIDENT) {
        token user { id role }
      }
    }
  `);
  if (r.data?.register?.token) {
    residentToken = r.data.register.token;
    residentId    = r.data.register.user.id;
    ok(`Register resident (role=${r.data.register.user.role})`);
  } else {
    fail('Register resident', JSON.stringify(r.errors));
  }
}

// Register staff
{
  const r = await gql(`
    mutation {
      register(name:"Test Staff", email:"${staffEmail}", password:"Pass1234!", role:STAFF) {
        token user { id role }
      }
    }
  `);
  if (r.data?.register?.token) {
    staffToken = r.data.register.token;
    staffId    = r.data.register.user.id;
    ok(`Register staff (role=${r.data.register.user.role})`);
  } else {
    fail('Register staff', JSON.stringify(r.errors));
  }
}

// Login resident
{
  const r = await gql(`
    mutation {
      login(email:"${residentEmail}", password:"Pass1234!") { token user { id } }
    }
  `);
  r.data?.login?.token ? ok('Login resident') : fail('Login resident', JSON.stringify(r.errors));
}

// Login with wrong password
{
  const r = await gql(`
    mutation { login(email:"${residentEmail}", password:"WrongPass") { token } }
  `);
  r.errors?.length ? ok('Login with wrong password correctly rejected') : fail('Login with wrong password should have errored');
}

// me query
{
  const r = await gql(`query { me { id email role } }`, {}, residentToken);
  r.data?.me?.email === residentEmail ? ok(`me query returns correct user`) : fail('me query', JSON.stringify(r));
}

// ── 3. Issue (civic logic) ──────────────────────────────────────────────────

section('Civic Logic — Issue Reporting');

let issueId, urgentIssueId;

// Report an issue with explicit category
{
  const r = await gql(`
    mutation {
      reportIssue(
        title: "Broken streetlight on Main St"
        description: "The lamp on the corner of Main and 1st has been out for 3 days."
        category: STREETLIGHT
        location: { address: "Main St & 1st Ave" }
      ) { id title category priority status aiSuggestedCategory aiSuggestedPriority }
    }
  `, {}, residentToken);
  const issue = r.data?.reportIssue;
  if (issue?.id) {
    issueId = issue.id;
    ok(`reportIssue (explicit category) → id=${issueId}, status=${issue.status}, priority=${issue.priority}`);
    issue.category === 'STREETLIGHT' ? ok('  category matches STREETLIGHT') : fail('  category mismatch', issue.category);
  } else {
    fail('reportIssue', JSON.stringify(r.errors));
  }
}

// Report issue with AI categorization (no category provided)
{
  const r = await gql(`
    mutation {
      reportIssue(
        title: "Massive pothole cracked my tire"
        description: "There is a dangerous pothole on Elm Ave that has damaged multiple vehicles."
        useAiCategorization: true
      ) { id category priority aiSuggestedCategory aiSuggestedPriority }
    }
  `, {}, residentToken);
  const issue = r.data?.reportIssue;
  if (issue?.id) {
    ok(`reportIssue with useAiCategorization → category=${issue.category}, aiSuggested=${issue.aiSuggestedCategory}, priority=${issue.priority}`);
  } else {
    fail('reportIssue with AI categorization', JSON.stringify(r.errors));
  }
}

// Report URGENT issue (should trigger staff notifications)
{
  const r = await gql(`
    mutation {
      reportIssue(
        title: "Urgent flooding emergency blocking road"
        description: "Severe flood collapse at bridge, road unsafe, immediate response needed."
        useAiCategorization: true
      ) { id priority category }
    }
  `, {}, residentToken);
  const issue = r.data?.reportIssue;
  if (issue?.id) {
    urgentIssueId = issue.id;
    ok(`reportIssue urgent issue → id=${urgentIssueId}, priority=${issue.priority}, category=${issue.category}`);
    if (issue.priority === 'URGENT') ok('  correctly detected as URGENT priority');
    else console.log(`  ℹ️  priority=${issue.priority} (fallback may assign MEDIUM if key is invalid)`);
  } else {
    fail('reportIssue urgent', JSON.stringify(r.errors));
  }
}

// List all issues
{
  const r = await gql(`query { issues { id title status priority category } }`, {}, residentToken);
  const issues = r.data?.issues;
  if (Array.isArray(issues)) {
    ok(`issues query returns ${issues.length} issue(s)`);
  } else {
    fail('issues query', JSON.stringify(r.errors));
  }
}

// Filter issues by status
{
  const r = await gql(`query { issues(filter:{status:OPEN}) { id status } }`, {}, residentToken);
  const issues = r.data?.issues;
  if (Array.isArray(issues) && issues.every(i => i.status === 'OPEN')) {
    ok(`filter by status=OPEN returns ${issues.length} issue(s), all OPEN`);
  } else {
    fail('filter issues by status', JSON.stringify(r.errors ?? issues));
  }
}

// mineOnly filter
{
  const r = await gql(`query { issues(filter:{mineOnly:true}) { id } }`, {}, residentToken);
  Array.isArray(r.data?.issues) ? ok(`mineOnly filter works (${r.data.issues.length} issues)`) : fail('mineOnly filter', JSON.stringify(r.errors));
}

section('Civic Logic — Staff Operations');

// updateIssueStatus (STAFF only)
{
  const r = await gql(`
    mutation { updateIssueStatus(id:"${issueId}", status:IN_PROGRESS) { id status } }
  `, {}, staffToken);
  const issue = r.data?.updateIssueStatus;
  issue?.status === 'IN_PROGRESS' ? ok('updateIssueStatus → IN_PROGRESS') : fail('updateIssueStatus', JSON.stringify(r.errors));
}

// updateIssueStatus as resident (should fail)
{
  const r = await gql(`
    mutation { updateIssueStatus(id:"${issueId}", status:RESOLVED) { id status } }
  `, {}, residentToken);
  r.errors?.length ? ok('updateIssueStatus by resident correctly rejected') : fail('updateIssueStatus by resident should have errored');
}

// assignIssue
{
  const r = await gql(`
    mutation { assignIssue(id:"${issueId}", userId:"${staffId}") { id assignedTo { id role } } }
  `, {}, staffToken);
  r.data?.assignIssue?.assignedTo?.id === staffId ? ok('assignIssue → staff assigned') : fail('assignIssue', JSON.stringify(r.errors));
}

// updateIssuePriority
{
  const r = await gql(`
    mutation { updateIssuePriority(id:"${issueId}", priority:HIGH) { id priority } }
  `, {}, staffToken);
  r.data?.updateIssuePriority?.priority === 'HIGH' ? ok('updateIssuePriority → HIGH') : fail('updateIssuePriority', JSON.stringify(r.errors));
}

// Resolve issue
{
  const r = await gql(`
    mutation { updateIssueStatus(id:"${issueId}", status:RESOLVED) { id status } }
  `, {}, staffToken);
  r.data?.updateIssueStatus?.status === 'RESOLVED' ? ok('updateIssueStatus → RESOLVED') : fail('updateIssueStatus RESOLVED', JSON.stringify(r.errors));
}

section('Civic Logic — Comments');

let commentId;
{
  const r = await gql(`
    mutation { addComment(issueId:"${issueId}", body:"Staff is on site inspecting.") { id body } }
  `, {}, staffToken);
  const c = r.data?.addComment;
  if (c?.id) {
    commentId = c.id;
    ok(`addComment → id=${commentId}`);
  } else {
    fail('addComment', JSON.stringify(r.errors));
  }
}

// Verify comment appears on issue
{
  const r = await gql(`query { issue(id:"${issueId}") { comments { id body } } }`, {}, staffToken);
  const comments = r.data?.issue?.comments;
  comments?.length > 0 ? ok(`issue.comments includes new comment (${comments.length} total)`) : fail('comments on issue', JSON.stringify(r));
}

section('Civic Logic — Notifications');

// Resident should have a STATUS_UPDATE notification from the status change
{
  const r = await gql(`query { myNotifications { id type message read } }`, {}, residentToken);
  const notifs = r.data?.myNotifications;
  if (Array.isArray(notifs)) {
    ok(`myNotifications returns ${notifs.length} notification(s)`);
    const statusUpdate = notifs.find(n => n.type === 'STATUS_UPDATE');
    statusUpdate ? ok(`STATUS_UPDATE notification present: "${statusUpdate.message}"`) : fail('No STATUS_UPDATE notification found');
    // Mark first notification read
    if (notifs.length > 0) {
      const r2 = await gql(`
        mutation { markNotificationRead(id:"${notifs[0].id}") { id read } }
      `, {}, residentToken);
      r2.data?.markNotificationRead?.read === true ? ok('markNotificationRead → read=true') : fail('markNotificationRead', JSON.stringify(r2.errors));
    }
  } else {
    fail('myNotifications', JSON.stringify(r.errors));
  }
}

// Staff should have URGENT_ALERT if urgent issue was URGENT priority
if (urgentIssueId) {
  const r = await gql(`query { myNotifications { id type message } }`, {}, staffToken);
  const notifs = r.data?.myNotifications;
  if (Array.isArray(notifs)) {
    const urgentAlert = notifs.find(n => n.type === 'URGENT_ALERT');
    urgentAlert
      ? ok(`Staff URGENT_ALERT notification present: "${urgentAlert.message}"`)
      : console.log(`  ℹ️  No URGENT_ALERT for staff (issue may not have been URGENT priority — expected if Gemini key is invalid)`);
  }
}

// ── 4. AI / Gemini ───────────────────────────────────────────────────────────

section('AI — Gemini / Fallback');

// summarizeIssueById
{
  const r = await gql(`query { summarizeIssueById(id:"${issueId}") }`, {}, staffToken);
  const s = r.data?.summarizeIssueById;
  if (typeof s === 'string' && s.length > 0) {
    ok(`summarizeIssueById returns summary (${s.length} chars): "${s.slice(0, 80)}…"`);
  } else {
    fail('summarizeIssueById', JSON.stringify(r.errors));
  }
}

// dashboardSummary
{
  const r = await gql(`
    query {
      dashboardSummary {
        total open inProgress resolved urgent
        byCategory { category count }
        byStatus { status count }
        aiTrendInsights
      }
    }
  `, {}, staffToken);
  const d = r.data?.dashboardSummary;
  if (d?.total >= 0) {
    ok(`dashboardSummary: total=${d.total}, open=${d.open}, resolved=${d.resolved}, urgent=${d.urgent}`);
    ok(`byCategory has ${d.byCategory.length} bucket(s): ${d.byCategory.map(c => `${c.category}:${c.count}`).join(', ')}`);
    ok(`aiTrendInsights (${d.aiTrendInsights.length} chars): "${d.aiTrendInsights.slice(0, 100)}…"`);
  } else {
    fail('dashboardSummary', JSON.stringify(r.errors));
  }
}

// Chatbot — fallback path queries
const chatTests = [
  { msg: 'How many issues are open?',    label: 'chat: status query' },
  { msg: 'Show me recent issues',        label: 'chat: recent query' },
  { msg: 'Any safety alerts?',           label: 'chat: safety query' },
  { msg: 'What are the current trends?', label: 'chat: trend query' },
  { msg: 'Hello there!',                 label: 'chat: general greeting' },
];

for (const { msg, label } of chatTests) {
  const r = await gql(`
    mutation { chat(message: ${JSON.stringify(msg)}) { reply source } }
  `, {}, residentToken);
  const c = r.data?.chat;
  if (c?.reply) {
    c.source === 'gemini' ? ok(`${label} → source=gemini, reply="${c.reply.slice(0, 80)}"`) : fail(`${label} expected source=gemini but got source=${c.source}`);
  } else {
    fail(label, JSON.stringify(r.errors));
  }
}

// ── 5. Auth edge cases ────────────────────────────────────────────────────────

section('Auth — Edge Cases');

// Duplicate email registration
{
  const r = await gql(`
    mutation { register(name:"Dup", email:"${residentEmail}", password:"Pass1234!", role:RESIDENT) { token } }
  `);
  r.errors?.length ? ok('Duplicate email registration correctly rejected') : fail('Duplicate email should have errored');
}

// Unauthenticated access to protected query
{
  const r = await gql(`query { issues { id } }`);
  r.errors?.length ? ok('Unauthenticated issues query correctly rejected') : fail('Unauthenticated issues should have errored');
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(55)}`);
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(55)}\n`);

if (failed > 0) process.exit(1);
