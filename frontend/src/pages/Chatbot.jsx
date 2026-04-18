import { useRef, useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CHAT_MUTATION } from '../graphql/mutations';

const STARTERS = [
  'How many issues are open right now?',
  'Show me recent safety alerts',
  'What are the current trends?',
  'List the most recent issues',
];

function fmtSource(source, ms) {
  if (source === 'gemini') return `Gemini${ms ? ` · ${ms}ms` : ''}`;
  if (source === 'fallback') return 'Fallback · 0ms';
  return null;
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi, I'm CivicBot. Ask me about open issues, resolved issues, safety alerts, or current trends.",
      source: 'system',
    },
  ]);
  const [input, setInput] = useState('');
  const [chatMutation, { loading }] = useMutation(CHAT_MUTATION);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message) return;
    const history = messages
      .filter((m) => m.source !== 'system' && m.source !== 'error')
      .map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    const t0 = Date.now();
    try {
      const { data } = await chatMutation({ variables: { message, history } });
      const ms = Date.now() - t0;
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.chat.reply, source: data.chat.source, ms },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}`, source: 'error' },
      ]);
    }
  };

  const hasUserMessages = messages.some((m) => m.role === 'user');

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink">
          <Sparkles size={18} strokeWidth={2} className="text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-ink text-display-md leading-tight">CivicBot</h1>
          <p className="text-body-sm text-ink-mute">
            Ask about open issues, trends, and safety alerts — powered by Gemini.
          </p>
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="mb-6 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about open issues, trends, or safety alerts…"
          className="field-input flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-ink"
          aria-label="Send"
        >
          {loading ? 'Thinking…' : <>Send <ArrowRight size={15} strokeWidth={2} /></>}
        </button>
      </form>

      {/* Starter prompts */}
      {!hasUserMessages && (
        <div className="mb-6 panel p-5">
          <p className="text-label uppercase tracking-widest font-medium text-ink-mute mb-3">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                className="pill disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation */}
      <div className="flex flex-col gap-3">
        {messages.map((m, idx) => {
          if (m.role === 'user') {
            return (
              <div key={idx} className="flex justify-end">
                <div className="max-w-[85%] rounded-xl rounded-br-sm bg-ink px-4 py-2.5 text-white text-body">
                  {m.content}
                </div>
              </div>
            );
          }
          if (m.source === 'system') {
            return (
              <div key={idx} className="panel p-4">
                <p className="text-body text-ink-mute">{m.content}</p>
              </div>
            );
          }
          if (m.source === 'error') {
            return (
              <div key={idx} className="rounded-xl border border-flag/30 bg-flag-soft p-4">
                <p className="text-body text-flag">{m.content}</p>
              </div>
            );
          }
          return (
            <div key={idx} className="panel p-4">
              <p className="text-body text-ink whitespace-pre-wrap">{m.content}</p>
              {fmtSource(m.source, m.ms) && (
                <p className="mt-2 font-mono text-mono text-ink-faint">
                  {fmtSource(m.source, m.ms)}
                </p>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="panel p-4">
            <p className="text-body text-ink-mute">Thinking…</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
