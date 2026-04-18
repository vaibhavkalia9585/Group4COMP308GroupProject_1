const { GoogleGenerativeAI } = require('@google/generative-ai');
const { CATEGORIES, PRIORITIES } = require('../../models/Issue');

const getModel = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not configured');
  const client = new GoogleGenerativeAI(key);
  return client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
};

const extractJson = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object in model response');
  return JSON.parse(match[0]);
};

async function classifyIssue({ title, description }) {
  const model = getModel();
  const prompt = `You are an assistant for a Canadian municipality's civic issue tracker.
Classify the following resident-reported issue.

Title: ${title}
Description: ${description}

Return ONLY a JSON object with this exact shape and nothing else:
{"category": "<one of ${CATEGORIES.join(', ')}>", "priority": "<one of ${PRIORITIES.join(', ')}>"}`;

  const result = await model.generateContent(prompt);
  const parsed = extractJson(result.response.text());
  const category = CATEGORIES.includes(parsed.category) ? parsed.category : 'OTHER';
  const priority = PRIORITIES.includes(parsed.priority) ? parsed.priority : 'MEDIUM';
  return { category, priority };
}

async function summarizeIssue({ title, description, comments = [] }) {
  const model = getModel();
  const joined = comments.map((c) => `- ${c}`).join('\n');
  const prompt = `Summarize this civic issue in 2 concise sentences for a municipal staff dashboard.

Title: ${title}
Description: ${description}
Comments:
${joined || '(none)'}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

async function generateTrendInsights(issues) {
  const model = getModel();
  const sample = issues.slice(0, 40).map((i) => ({
    category: i.category,
    status: i.status,
    priority: i.priority,
    title: i.title,
  }));

  const prompt = `You are analyzing civic issue reports for a Canadian municipality.
Identify 2-3 short insights (clusters, spikes, neighborhoods to watch) in plain English.
Return a single paragraph, no bullets.

Data (JSON): ${JSON.stringify(sample)}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

module.exports = { classifyIssue, summarizeIssue, generateTrendInsights, getModel };
