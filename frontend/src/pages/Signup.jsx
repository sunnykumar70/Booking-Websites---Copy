import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../api';
import './Auth.css';

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const userStr = queryParams.get('user');
        const errorMsg = queryParams.get('error');

        if (errorMsg) {
            setError(errorMsg);
        } else if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));
                loginUser(token, user);
                navigate('/');
            } catch (err) {
                console.error("Failed to parse user data", err);
                setError('Failed to login with social provider');
            }
        }
    }, [location, loginUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) return setError('Passwords do not match');
        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true);
        try {
            const res = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
            loginUser(res.data.token, res.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally { setLoading(false); }
    };

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-in">
                <div className="auth-header">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#f97316"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    <span className="auth-brand">MakeUs<span>Trip</span></span>
                </div>
                <h2>Create Account</h2>
                <p className="auth-subtitle">Join us and explore amazing travel deals</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field"><label>Full Name</label><input type="text" value={form.name} onChange={e => update('name', e.target.value)} required className="form-input" placeholder="John Doe" /></div>
                    <div className="auth-field"><label>Email Address</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} required className="form-input" placeholder="you@example.com" /></div>
                    <div className="auth-field"><label>Phone Number</label><input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} required className="form-input" placeholder="10-digit mobile number" /></div>
                    <div className="auth-field"><label>Password</label><input type="password" value={form.password} onChange={e => update('password', e.target.value)} required className="form-input" placeholder="Minimum 6 characters" /></div>
                    <div className="auth-field"><label>Confirm Password</label><input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required className="form-input" placeholder="Re-enter password" /></div>
                    {error && <div className="auth-error">{error}</div>}
                    <button type="submit" className="btn-primary auth-submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
                </form>
                <div className="auth-divider" style={{marginTop: '20px', marginBottom: '20px', textAlign: 'center', position: 'relative', opacity: 0.7}}>
                    <span style={{background: '#fff', padding: '0 10px', fontSize: '0.9rem'}}>Or continue with</span>
                </div>
                <div className="auth-social" style={{display: 'flex', gap: '15px', marginBottom: '20px'}}>
                    <button onClick={() => window.location.href = 'http://localhost:5001/api/auth/google'} type="button" className="social-btn" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease', background: 'white', color: '#333' }}>
                        🔵 Google
                    </button>
                    <button onClick={() => window.location.href = 'http://localhost:5001/api/auth/facebook'} type="button" className="social-btn" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease', background: 'white', color: '#333' }}>
                        🔷 Facebook
                    </button>
                </div>
                <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
}
