import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './Header.css';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => { logout(); setDropdownOpen(false); navigate('/'); };

    return (
        <header className="header">
            <div className="container header-inner">
                <Link to="/" className="logo">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="#f97316"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    <span>MakeUs<span className="logo-accent">Trip</span></span>
                </Link>

                <nav className="nav-desktop">
                    <Link to="/?tab=flights" className="nav-link">✈️ Flights</Link>
                    <Link to="/?tab=hotels" className="nav-link">🏨 Hotels</Link>
                    <Link to="/?tab=buses" className="nav-link">🚌 Buses</Link>
                    <Link to="/?tab=trains" className="nav-link">🚆 Trains</Link>
                    <Link to="/group-trip" className="nav-link">👥 Group Trip</Link>
                    <Link to="/community" className="nav-link">📸 Community</Link>
                </nav>

                <div className="header-actions">
                    {user ? (
                        <div className="user-menu">
                            <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                                <span className="user-name">{user.name?.split(' ')[0]}</span>
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {dropdownOpen && (
                                <div className="dropdown animate-fade-in">
                                    <div className="dropdown-header">
                                        <div className="dropdown-name">{user.name}</div>
                                        <div className="dropdown-email">{user.email}</div>
                                        <div className="dropdown-tier badge badge-orange">{user.tier || 'Bronze'} • {user.rewardPoints || 0} pts</div>
                                    </div>
                                    <Link to="/my-bookings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>📋 My Bookings</Link>
                                    <Link to="/create-ticket" className="dropdown-item" onClick={() => setDropdownOpen(false)}>🎫 Raise Ticket</Link>
                                    <hr />
                                    <button className="dropdown-item logout" onClick={handleLogout}>🚪 Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>Login</Link>
                    )}
                    <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
            </div>
            {mobileOpen && (
                <div className="mobile-menu animate-fade-in">
                    <Link to="/?tab=flights" className="mobile-link" onClick={() => setMobileOpen(false)}>✈️ Flights</Link>
                    <Link to="/?tab=hotels" className="mobile-link" onClick={() => setMobileOpen(false)}>🏨 Hotels</Link>
                    <Link to="/?tab=buses" className="mobile-link" onClick={() => setMobileOpen(false)}>🚌 Buses</Link>
                    <Link to="/?tab=trains" className="mobile-link" onClick={() => setMobileOpen(false)}>🚆 Trains</Link>
                    <Link to="/group-trip" className="mobile-link" onClick={() => setMobileOpen(false)}>👥 Group Trip</Link>
                    <Link to="/community" className="mobile-link" onClick={() => setMobileOpen(false)}>📸 Community</Link>
                </div>
            )}
        </header>
    );
}
