import { useState } from 'react';
import { adminLogin } from '../api';

export default function AdminLogin({ onLogin }) {
    const [email, setEmail] = useState('admin@makeustrip.com');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await adminLogin({ email, password });
            if (res.data.user.role !== 'admin') { setError('Access denied. Admin only.'); return; }
            onLogin(res.data.token, res.data.user);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="admin-login">
            <div className="admin-login-card animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>🛡️</div>
                    <h2>Admin Dashboard</h2>
                    <p className="subtitle">MakeUsTrip Management Portal</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="auth-field"><label>Email</label><input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                    <div className="auth-field"><label>Password</label><input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter admin password" /></div>
                    {error && <div className="auth-error">{error}</div>}
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14 }} disabled={loading}>{loading ? 'Logging in...' : 'Login to Dashboard'}</button>
                </form>
                <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 20 }}>Default: admin@makeustrip.com / admin123</p>
            </div>
        </div>
    );
}
