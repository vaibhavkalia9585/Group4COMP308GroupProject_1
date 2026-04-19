import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { REPORT_ISSUE_MUTATION } from '../graphql/mutations';
import PageTitle from '../components/PageTitle';

const CATEGORIES = [
  { value: '', label: 'Let us classify it automatically (recommended)' },
  { value: 'POTHOLE', label: 'Pothole' },
  { value: 'STREETLIGHT', label: 'Streetlight' },
  { value: 'FLOODING', label: 'Flooding' },
  { value: 'SAFETY', label: 'Safety hazard' },
  { value: 'GARBAGE', label: 'Garbage' },
  { value: 'NOISE', label: 'Noise' },
  { value: 'GRAFFITI', label: 'Graffiti' },
  { value: 'OTHER', label: 'Other' },
];

function StepHeader({ n, title, subtitle }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-body-sm font-semibold text-white">
        {n}
      </span>
      <div>
        <h2 className="text-body-lg font-semibold leading-tight text-text-primary">{title}</h2>
        {subtitle && <p className="text-body-sm text-text-secondary">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function ReportIssue() {
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
          <div className="mb-2 flex items-center gap-3">
            <CheckCircle2 size={24} strokeWidth={2} className="text-brand-primary" />
            <p className="text-label font-semibold uppercase tracking-widest text-brand-primary">
              Report submitted
            </p>
          </div>
          <h1 className="text-display-lg font-semibold text-text-primary">
            Your report has been received.
          </h1>
          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <p className="text-body-sm text-text-secondary">Reference</p>
            <p className="mt-0.5 font-mono text-[15px] font-semibold text-brand-primary">
              CASE-{result.id?.slice(-8).toUpperCase()}
            </p>
          </div>
          <p className="mt-5 text-body text-text-secondary">
            Filed as <strong className="text-text-primary">{result.category}</strong> with{' '}
            <strong className="text-text-primary">{result.priority.toLowerCase()}</strong> priority.
            City staff will review it and update the status. You&apos;ll be notified of any changes.
          </p>
          {result.aiSuggestedCategory && (
            <p className="mt-3 text-body-sm text-text-secondary">
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
        Tell us what&apos;s wrong. This report is shared with city staff and published to a
        public record.
      </PageTitle>

      <form onSubmit={onSubmit}>
        <div className="panel mb-5 p-6">
          <StepHeader n="1" title="What happened" subtitle="Describe the issue in a few sentences." />
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm font-medium text-text-primary">Title</span>
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
              <span className="text-body-sm font-medium text-text-primary">Description</span>
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
              <span className="text-body-sm font-medium text-text-primary">Category</span>
              <select name="category" value={form.category} onChange={onChange} className="field-input">
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="panel mb-5 p-6">
          <StepHeader n="2" title="Where it is" subtitle="A precise location helps staff triage faster." />
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm font-medium text-text-primary">Address</span>
              <input
                name="address"
                value={form.address}
                onChange={onChange}
                className="field-input"
                placeholder="123 King St W, Toronto, ON"
              />
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-body-sm font-medium text-text-primary">Latitude</span>
                <input
                  name="lat"
                  value={form.lat}
                  onChange={onChange}
                  className="field-input font-mono"
                  placeholder="43.6532"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-body-sm font-medium text-text-primary">Longitude</span>
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

        <div className="panel mb-5 p-6">
          <StepHeader n="3" title="Anything else" subtitle="Optional: a photo makes reports easier to triage." />
          <label className="flex flex-col gap-1.5">
            <span className="text-body-sm font-medium text-text-primary">Image URL (optional)</span>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={onChange}
              className="field-input"
              placeholder="https://example.com/photo.jpg"
            />
          </label>
        </div>

        {error && <p className="mb-4 text-body-sm text-brand-accent">{error}</p>}

        <div className="flex flex-col items-center gap-3">
          <button type="submit" className="btn-ink w-full px-7 py-3 sm:w-auto" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit report'}
          </button>
          <p className="text-center text-body-sm text-text-secondary">
            Your name and email will be attached to this report.
          </p>
        </div>
      </form>
    </div>
  );
}
