import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Call login and wait for the raw Supabase response
      await login(form.email, form.password);
      
      // 2. If no error was thrown, it was successful!
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } catch (error) {
      // 3. Catch and display the exact error message from Supabase
      toast.error(error.message || 'Invalid login credentials');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-text">ShikshaSoft</div>
          <div className="login-logo-sub">Nepal School Management System</div>
        </div>
        <h2 className="login-title">Sign in to your school</h2>
        <p className="login-sub">Enter your credentials to access the dashboard.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email" className="form-input" placeholder="admin@school.edu.np"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" className="form-input" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: '8px', fontSize: '14px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div style={{ marginTop: '20px', padding: '12px', background: '#f3f4f6', borderRadius: '8px', fontSize: '12px', color: '#6b7280' }}>
          <strong>Demo:</strong> admin@shikshasoft.com / password
        </div>
      </div>
    </div>
  );
}
