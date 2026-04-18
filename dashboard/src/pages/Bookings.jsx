import { useState, useEffect } from 'react';
import { getBookings } from '../api';

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        getBookings().then(res => setBookings(res.data.bookings)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
    const statusBadge = { confirmed: 'badge-green', completed: 'badge-blue', cancelled: 'badge-red', pending: 'badge-yellow' };
    const typeEmoji = { flight: '✈️', hotel: '🏨', bus: '🚌', train: '🚆' };

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>📋 Booking Management</h1><p>View and manage all customer bookings</p></div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['all', 'confirmed', 'completed', 'cancelled'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`btn-sm ${filter === f ? 'btn-primary' : ''}`}
                        style={filter !== f ? { background: '#fff', border: '1px solid #e2e8f0', color: '#64748b' } : {}}>
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length})
                    </button>
                ))}
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead><tr><th>Booking Ref</th><th>Type</th><th>Customer</th><th>Route / City</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                        {loading ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr> :
                            filtered.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>No bookings found</td></tr> :
                                filtered.map(booking => (
                                    <tr key={booking._id}>
                                        <td><code style={{ fontSize: 12, fontWeight: 600 }}>{booking.bookingRef}</code></td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {typeEmoji[booking.type] || '📦'} <span style={{ textTransform: 'capitalize' }}>{booking.type}</span>
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{booking.user?.name || booking.travelerDetails?.firstName || 'N/A'}</td>
                                        <td>{booking.from && booking.to ? `${booking.from} → ${booking.to}` : booking.city || '-'}</td>
                                        <td style={{ fontWeight: 700, color: '#1e293b' }}>₹{booking.totalAmount?.toLocaleString()}</td>
                                        <td><span className={`badge ${statusBadge[booking.status]}`}>{booking.status}</span></td>
                                        <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                <div className="stat-card" style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Total Revenue</div>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>₹{bookings.reduce((s, b) => s + (b.status !== 'cancelled' ? (b.totalAmount || 0) : 0), 0).toLocaleString()}</div>
                </div>
                <div className="stat-card" style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Average Booking Value</div>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>₹{bookings.length ? Math.round(bookings.reduce((s, b) => s + (b.totalAmount || 0), 0) / bookings.length).toLocaleString() : 0}</div>
                </div>
                <div className="stat-card" style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Cancellation Rate</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: bookings.filter(b => b.status === 'cancelled').length / bookings.length > 0.2 ? '#ef4444' : '#10b981' }}>
                        {bookings.length ? Math.round(bookings.filter(b => b.status === 'cancelled').length / bookings.length * 100) : 0}%
                    </div>
                </div>
            </div>
        </div>
    );
}
