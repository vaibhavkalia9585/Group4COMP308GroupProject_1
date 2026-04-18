import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { REPORT_ISSUE_MUTATION } from '../graphql/mutations';
import PageTitle from '../components/PageTitle';

const CATEGORIES = [
  { value: '',           label: 'Let us classify it automatically (recommended)' },
  { value: 'POTHOLE',    label: 'Pothole' },
  { value: 'STREETLIGHT',label: 'Streetlight' },
  { value: 'FLOODING',   label: 'Flooding' },
  { value: 'SAFETY',     label: 'Safety hazard' },
  { value: 'GARBAGE',    label: 'Garbage' },
  { value: 'NOISE',      label: 'Noise' },
  { value: 'GRAFFITI',   label: 'Graffiti' },
  { value: 'OTHER',      label: 'Other' },
];

function StepHeader({ n, title, subtitle }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white text-body-sm font-semibold">
        {n}
      </span>
      <div>
        <h2 className="font-semibold text-ink text-body-lg leading-tight">{title}</h2>
        {subtitle && <p className="text-body-sm text-ink-mute">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function ReportIssue() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    address: '', lat: '', lng: '', imageUrl: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [reportIssue, { loading }] = useMutation(REPORT_ISSUE_MUTATION);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm((f) => ({
        ...f,
        lat: String(pos.coords.latitude),
        lng: String(pos.coords.longitude),
      }));
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      const { data } = await reportIssue({
        variables: {
          title: form.title,
          description: form.description,
          category: form.category || null,
          location: {
            address: form.address,
            lat: form.lat ? parseFloat(form.lat) : null,
            lng: form.lng ? parseFloat(form.lng) : null,
          },
          imageUrl: form.imageUrl || null,
          useAiCategorization: !form.category,
        },
      });
      setResult(data.reportIssue);
    } catch (err) {
      setError(err.message);
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="panel p-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={24} strokeWidth={2} className="text-moss" />
            <p className="text-label uppercase tracking-widest font-semibold text-moss">
              Report submitted
            </p>
          </div>
          <h1 className="font-semibold text-ink text-display-lg">
            Your report has been received.
          </h1>
          <div className="mt-6 rounded-lg bg-paper-dim p-4">
            <p className="text-body-sm text-ink-mute">Reference</p>
            <p className="font-mono text-civic font-semibold mt-0.5" style={{ fontSize: '15px' }}>
              CASE-{result.id?.slice(-8).toUpperCase()}
            </p>
          </div>
          <p className="text-body text-ink-soft mt-5">
            Filed as <strong>{result.category}</strong> with{' '}
            <strong>{result.priority.toLowerCase()}</strong> priority. City staff will
            review it and update the status. You'll be notified of any changes.
          </p>
          {result.aiSuggestedCategory && (
            <p className="mt-3 text-body-sm text-ink-mute">
              <span className="font-mono text-mono">AI classification:</span>{' '}
              {result.aiSuggestedCategory} / {result.aiSuggestedPriority}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/my-issues" className="btn-ink">View my reports</Link>
            <button onClick={() => setResult(null)} className="btn-ghost">
              Submit another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle label="Municipal Services" title="Report a problem">
        Tell us what's wrong. This report is shared with city staff and published to a
        public record.
      </PageTitle>

      <form onSubmit={onSubmit}>
        {/* Step 1 */}
        <div className="panel p-6 mb-5">
          <StepHeader n="1" title="What happened" subtitle="Describe the issue in a few sentences." />
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm font-medium text-ink">Title</span>
              <input
                name="title"
                required
                value={form.title}
                onChange={onChange}
                className="field-input"
                placeholder="e.g. Large pothole on King St"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm font-medium text-ink">Description</span>
              <textarea
                name="description"
                required
                rows={4}
                value={form.description}
                onChange={onChange}
                className="field-input resize-none"
                placeholder="What did you find? How dangerous is it?"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm font-medium text-ink">Category</span>
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                className="field-input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Step 2 */}
        <div className="panel p-6 mb-5">
          <StepHeader n="2" title="Where it is" subtitle="A precise location helps staff triage faster." />
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm font-medium text-ink">Address</span>
              <input
                name="address"
                value={form.address}
                onChange={onChange}
                className="field-input"
                placeholder="123 King St W, Toronto, ON"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-body-sm font-medium text-ink">Latitude</span>
                <input
                  name="lat"
                  value={form.lat}
                  onChange={onChange}
                  className="field-input font-mono"
                  placeholder="43.6532"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-body-sm font-medium text-ink">Longitude</span>
                <input
                  name="lng"
                  value={form.lng}
                  onChange={onChange}
                  className="field-input font-mono"
                  placeholder="-79.3832"
                />
              </label>
            </div>
            <button type="button" onClick={useMyLocation} className="btn-ghost self-start">
              <MapPin size={15} strokeWidth={2} />
              Use my current location
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="panel p-6 mb-5">
          <StepHeader n="3" title="Anything else" subtitle="Optional — a photo makes reports easier to triage." />
          <label className="flex flex-col gap-1.5">
            <span className="text-body-sm font-medium text-ink">Image URL (optional)</span>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={onChange}
              className="field-input"
              placeholder="https://…"
            />
          </label>
        </div>

        {error && <p className="mb-4 text-body-sm text-flag">{error}</p>}

        <div className="flex flex-col items-center gap-3">
          <button type="submit" className="btn-ink w-full sm:w-auto" disabled={loading} style={{ padding: '0.75rem 1.75rem' }}>
            {loading ? 'Submitting…' : 'Submit report'}
          </button>
          <p className="text-body-sm text-ink-mute text-center">
            Your name and email will be attached to this report.
          </p>
        </div>
      </form>
    </div>
  );
}
