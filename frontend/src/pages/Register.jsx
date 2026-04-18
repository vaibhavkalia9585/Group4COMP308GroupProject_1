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
        <h1 className="font-semibold text-ink text-display-lg">Create account</h1>
        <p className="mt-1 text-body text-ink-mute">Join CivicCase to report and track issues.</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-body-sm font-medium text-ink">Full name</span>
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
            <span className="text-body-sm font-medium text-ink">Email</span>
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
            <span className="text-body-sm font-medium text-ink">Password</span>
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
            <span className="text-body-sm font-medium text-ink">Role</span>
            <select name="role" value={form.role} onChange={onChange} className="field-input">
              <option value="RESIDENT">Resident</option>
              <option value="STAFF">Municipal Staff</option>
              <option value="ADVOCATE">Community Advocate</option>
            </select>
          </label>

          {error && <p className="text-body-sm text-flag">{error}</p>}

          <button type="submit" className="btn-ink w-full mt-2" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <hr className="hr-thin mt-6 mb-4" />
        <p className="text-body-sm text-ink-mute text-center">
          Already have an account?{' '}
          <Link to="/login" className="link">Sign in.</Link>
        </p>
      </div>
    </div>
  );
}
