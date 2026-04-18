import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../api';
import './Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        setError(''); setLoading(true);
        try {
            const res = await login({ email, password });
            loginUser(res.data.token, res.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-in">
                <div className="auth-header">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#f97316"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    <span className="auth-brand">MakeUs<span>Trip</span></span>
                </div>
                <h2>Welcome Back!</h2>
                <p className="auth-subtitle">Login to access your bookings and exclusive deals</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" placeholder="you@example.com" />
                    </div>
                    <div className="auth-field">
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" placeholder="Enter your password" />
                    </div>
                    {error && <div className="auth-error">{error}</div>}
                    <button type="submit" className="btn-primary auth-submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                </form>

                <div className="auth-divider"><span>Or continue with</span></div>
                <div className="auth-social">
                    <button onClick={() => window.location.href = 'http://localhost:5001/api/auth/google'} type="button" className="social-btn" style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔵 Google</button>
                    <button onClick={() => window.location.href = 'http://localhost:5001/api/auth/facebook'} type="button" className="social-btn" style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔷 Facebook</button>
                </div>
                <p className="auth-switch">Don't have an account? <Link to="/signup">Sign Up</Link></p>
            </div>
        </div>
    );
}
