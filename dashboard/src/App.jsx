import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const user = localStorage.getItem('admin_user');
        if (token && user) {
            try { setAdmin(JSON.parse(user)); } catch { }
        }
        setLoading(false);
    }, []);

    const handleLogin = (token, user) => {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
        setAdmin(user);
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setAdmin(null);
    };

    if (loading) return null;

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={admin ? <Navigate to="/" /> : <AdminLogin onLogin={handleLogin} />} />
                <Route path="/*" element={admin ? <Dashboard admin={admin} onLogout={handleLogout} /> : <Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
