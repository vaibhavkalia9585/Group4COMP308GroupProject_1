import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'RESIDENT' });
  const [error, setError] = useState('');
  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await registerMutation({ variables: form });
      login(data.register.token, data.register.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md py-8">
      <div className="panel p-8">
        <h1 className="text-display-lg font-semibold text-text-primary">Create account</h1>
        <p className="mt-1 text-body text-text-secondary">Join CivicCase to report and track issues.</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-body-sm font-medium text-text-primary">Full name</span>
            <input
              name="name"
              required
              value={form.name}
              onChange={onChange}
              className="field-input"
              placeholder="Jane Doe"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-body-sm font-medium text-text-primary">Email</span>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={onChange}
              className="field-input"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-body-sm font-medium text-text-primary">Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={onChange}
              className="field-input"
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-body-sm font-medium text-text-primary">Role</span>
            <select name="role" value={form.role} onChange={onChange} className="field-input">
              <option value="RESIDENT">Resident</option>
              <option value="STAFF">Municipal Staff</option>
              <option value="ADVOCATE">Community Advocate</option>
            </select>
          </label>

          {error && <p className="text-body-sm text-brand-accent">{error}</p>}

          <button type="submit" className="btn-ink mt-2 w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <hr className="hr-thin mb-4 mt-6" />
        <p className="text-center text-body-sm text-text-secondary">
          Already have an account? <Link to="/login" className="link">Sign in.</Link>
        </p>
      </div>
    </div>
  );
}
