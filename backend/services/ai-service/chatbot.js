/**
 * Agentic chatbot for CivicCase — two-step router/respond using the raw Gemini SDK.
 *
 * Step 1 (route):   LLM picks which data tool to call.
 * Step 2 (respond): tool is executed against MongoDB; result + history fed back to LLM.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Issue = require('../../models/Issue');
const { generateTrendInsights } = require('./gemini');

const SYSTEM_PROMPT = `You are CivicBot, the assistant for a Canadian municipality's civic issue tracker.
You help residents and staff with questions about local issues (open, in progress, resolved),
trends, and urgent safety alerts. Be concise and friendly.
When you have data from a TOOL_RESULT block, cite the numbers and titles plainly.`;

const ROUTER_PROMPT = `You are a router for a civic issue chatbot. Given the user message, reply with exactly ONE word.

Tools:
- status  → questions about counts: how many issues are open / resolved / in-progress
- recent  → questions about the latest or most recently reported issues
- safety  → questions about safety alerts, urgent issues, hazards, dangers
- trend   → questions about trends, patterns, clusters, insights
- none    → greetings, follow-up questions, thanks, or anything not about civic data

Reply with exactly one of: status, recent, safety, trend, none`;

// ── Tools ─────────────────────────────────────────────────────────────────────

async function toolCountByStatus() {
  const rows = await Issue.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
  return rows.reduce((acc, r) => ({ ...acc, [r._id]: r.n }), {});
}

async function toolListRecent(limit = 5) {
  const items = await Issue.find().sort({ createdAt: -1 }).limit(limit);
  return items.map((i) => ({ title: i.title, category: i.category, status: i.status, priority: i.priority }));
}

async function toolSafetyAlerts() {
  const items = await Issue.find({
    $or: [{ priority: 'URGENT' }, { category: 'SAFETY' }],
    status: { $ne: 'RESOLVED' },
  })
    .sort({ createdAt: -1 })
    .limit(10);
  return items.map((i) => ({
    title: i.title,
    status: i.status,
    priority: i.priority,
    address: i.location?.address || '',
  }));
}

async function toolTrendInsights() {
  const all = await Issue.find().sort({ createdAt: -1 }).limit(100);
  return generateTrendInsights(all);
}

async function runTool(name) {
  if (name === 'status') return await toolCountByStatus();
  if (name === 'recent') return await toolListRecent(5);
  if (name === 'safety') return await toolSafetyAlerts();
  if (name === 'trend')  return await toolTrendInsights();
  return null;
}

// ── Gemini helper ─────────────────────────────────────────────────────────────

function getModel(systemInstruction) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not configured');
  const client = new GoogleGenerativeAI(key);
  return client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    systemInstruction,
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

async function chat({ message, history = [] }) {
  // Step 1: route — pick the right tool
  const router = getModel(ROUTER_PROMPT);
  const routerResult = await router.generateContent(message);
  const raw = routerResult.response.text().trim().toLowerCase().split(/\s+/)[0];
  const toolName = ['status', 'recent', 'safety', 'trend', 'none'].includes(raw) ? raw : 'none';

  // Step 2: fetch tool data from MongoDB
  const toolData = await runTool(toolName);

  // Step 3: generate natural-language answer
  const historyBlock = history.length
    ? '\n\nConversation so far:\n' +
      history.map((h) => `${h.role === 'user' ? 'User' : 'CivicBot'}: ${h.content}`).join('\n')
    : '';
  const toolBlock = toolData
    ? `\n\nTOOL_RESULT(${toolName}): ${JSON.stringify(toolData)}`
    : '';

  const responder = getModel(SYSTEM_PROMPT + historyBlock + toolBlock);
  const finalResult = await responder.generateContent(message);

  return { reply: finalResult.response.text().trim(), source: 'gemini' };
}

module.exports = { chat };
