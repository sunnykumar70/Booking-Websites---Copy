import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, cancelBooking } from '../api';
import BackButton from '../components/BackButton';
import './MyBookings.css';

export default function MyBookings() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        getMyBookings().then(res => setBookings(res.data.bookings)).catch(() => { }).finally(() => setLoading(false));
    }, [user]);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await cancelBooking(id);
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
        } catch (err) {
            alert('Cancellation failed');
        }
    };

    const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
    const statusColor = { confirmed: 'badge-green', completed: 'badge-blue', cancelled: 'badge-red', pending: 'badge-yellow' };

    return (
        <div className="bookings-page">
            <div className="container">
                <BackButton />
                <div className="bookings-header">
                    <h1>📋 My Bookings</h1>
                    <p>Manage all your travel bookings in one place</p>
                </div>

                <div className="bookings-filters">
                    {['all', 'confirmed', 'completed', 'cancelled'].map(f => (
                        <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${bookings.length})` : `(${bookings.filter(b => b.status === f).length})`}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-state">{[1, 2, 3].map(i => <div key={i} className="skeleton-card" style={{ height: 120 }}></div>)}</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state card-static">
                        <span className="empty-icon">🗺️</span>
                        <h3>No bookings found</h3>
                        <p>Your travel adventure awaits!</p>
                        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Explore Deals</button>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {filtered.map(booking => (
                            <div key={booking._id} className="booking-card card-static">
                                <div className="booking-card-left">
                                    <div className="booking-type-icon">{booking.type === 'flight' ? '✈️' : booking.type === 'hotel' ? '🏨' : booking.type === 'bus' ? '🚌' : '🚆'}</div>
                                    <div>
                                        <h3>{booking.from && booking.to ? `${booking.from} → ${booking.to}` : booking.city || booking.type}</h3>
                                        <p className="booking-ref">Ref: {booking.bookingRef}</p>
                                        <p className="booking-date">Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="booking-card-right">
                                    <span className={`badge ${statusColor[booking.status] || 'badge-blue'}`}>{booking.status}</span>
                                    <div className="booking-amount">₹{booking.totalAmount?.toLocaleString()}</div>
                                    {booking.status === 'confirmed' && <button className="cancel-btn" onClick={() => handleCancel(booking._id)}>Cancel</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
