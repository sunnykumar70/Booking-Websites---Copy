import { useState, useEffect } from 'react';
import { getStats } from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function Overview() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStats().then(res => setStats(res.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading dashboard...</div>;
    if (!stats) return <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>Failed to load stats</div>;

    const statCards = [
        { icon: '💰', label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, bg: '#eef2ff' },
        { icon: '📋', label: 'Total Bookings', value: stats.totalBookings || 0, bg: '#f0fdf4' },
        { icon: '👥', label: 'Total Users', value: stats.totalUsers || 0, bg: '#fff7ed' },
        { icon: '🎫', label: 'Open Tickets', value: stats.openTickets || 0, bg: '#fef2f2' },
    ];

    const typeData = [
        { name: 'Flights', value: stats.bookingsByType?.flight || 0 },
        { name: 'Hotels', value: stats.bookingsByType?.hotel || 0 },
        { name: 'Buses', value: stats.bookingsByType?.bus || 0 },
        { name: 'Trains', value: stats.bookingsByType?.train || 0 },
    ];

    const revenueData = (stats.revenueByMonth || []).map(item => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][item._id - 1] || item._id,
        revenue: item.total
    }));

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>📊 Dashboard Overview</h1><p>Welcome back! Here's your business at a glance.</p></div>

            <div className="stats-grid">
                {statCards.map((card, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ background: card.bg }}>{card.icon}</div>
                        <div className="stat-value">{card.value}</div>
                        <div className="stat-label">{card.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <div className="chart-container">
                    <h3>📈 Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={revenueData.length ? revenueData : [{ month: 'Jan', revenue: 0 }]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} />
                            <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3>🎯 Bookings by Type</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={typeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                {typeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-container">
                <h3>📊 Recent Activity</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 8 }}>
                    <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Confirmed Bookings</div>
                        <div style={{ fontSize: 24, fontWeight: 800 }}>{stats.confirmedBookings || 0}</div>
                    </div>
                    <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Cancelled Bookings</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{stats.cancelledBookings || 0}</div>
                    </div>
                    <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>In-Progress Tickets</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{stats.inProgressTickets || 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
