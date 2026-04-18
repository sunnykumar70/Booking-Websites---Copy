import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import Overview from './Overview';
import Tickets from './Tickets';
import Users from './Users';
import Bookings from './Bookings';
import Deals from './Deals';
import BudgetPlaces from './BudgetPlaces';
import BudgetRoutes from './BudgetRoutes';

export default function Dashboard({ admin, onLogout }) {
    const navigate = useNavigate();

    const links = [
        { to: '/', icon: '📊', label: 'Overview' },
        { to: '/deals', icon: '🏷️', label: 'Deals' },
        { to: '/budget-places', icon: '📍', label: 'Budget Places' },
        { to: '/budget-routes', icon: '🛣️', label: 'Budget Routes' },
        { to: '/tickets', icon: '🎫', label: 'Tickets' },
        { to: '/users', icon: '👥', label: 'Users' },
        { to: '/bookings', icon: '📋', label: 'Bookings' },
    ];

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">MakeUs<span>Trip</span> Admin</div>
                <nav className="sidebar-nav">
                    {links.map(link => (
                        <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            <span className="link-icon">{link.icon}</span>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{admin.name?.charAt(0)}</div>
                        <div><div className="sidebar-user-name">{admin.name}</div><div className="sidebar-user-role">Administrator</div></div>
                    </div>
                    <button className="logout-btn" onClick={() => { onLogout(); navigate('/login'); }}>🚪 Logout</button>
                </div>
            </aside>
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="/deals" element={<Deals />} />
                    <Route path="/budget-places" element={<BudgetPlaces />} />
                    <Route path="/budget-routes" element={<BudgetRoutes />} />
                    <Route path="/tickets" element={<Tickets />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/bookings" element={<Bookings />} />
                </Routes>
            </div>
        </div>
    );
}
