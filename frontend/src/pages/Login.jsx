import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await loginMutation({ variables: form });
      login(data.login.token, data.login.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md py-8">
      <div className="panel p-8">
        <h1 className="text-display-lg font-semibold text-text-primary">Sign in</h1>
        <p className="mt-1 text-body text-text-secondary">Welcome back to CivicCase.</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
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
              value={form.password}
              onChange={onChange}
              className="field-input"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-body-sm text-brand-accent">{error}</p>}

          <button type="submit" className="btn-ink mt-2 w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <hr className="hr-thin mb-4 mt-6" />
        <p className="text-center text-body-sm text-text-secondary">
          Don't have an account? <Link to="/register" className="link">Create one.</Link>
        </p>
      </div>
    </div>
  );
}
