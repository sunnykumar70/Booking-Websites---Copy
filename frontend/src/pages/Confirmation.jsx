import { useLocation, useNavigate, Link } from 'react-router-dom';
import './Confirmation.css';

export default function Confirmation() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const booking = state?.booking;
    const points = state?.points || 0;

    if (!booking) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h2>No booking information</h2><button className="btn-primary" onClick={() => navigate('/')}>Go Home</button></div>;

    return (
        <div className="confirmation-page">
            <div className="container">
                <div className="success-card card-static animate-slide-up">
                    <div className="success-icon">✅</div>
                    <h1>Booking Confirmed!</h1>
                    <p className="success-subtitle">Your trip has been booked successfully</p>

                    <div className="booking-ref-card">
                        <span>Booking Reference</span>
                        <strong>{booking.bookingRef}</strong>
                    </div>

                    <div className="confirm-details-grid">
                        <div className="confirm-detail"><span className="detail-label">Type</span><span className="detail-value">{booking.type}</span></div>
                        {booking.from && <div className="confirm-detail"><span className="detail-label">Route</span><span className="detail-value">{booking.from} → {booking.to}</span></div>}
                        {booking.city && <div className="confirm-detail"><span className="detail-label">City</span><span className="detail-value">{booking.city}</span></div>}
                        <div className="confirm-detail"><span className="detail-label">Traveler</span><span className="detail-value">{booking.travelerDetails?.firstName} {booking.travelerDetails?.lastName}</span></div>
                        <div className="confirm-detail"><span className="detail-label">Amount Paid</span><span className="detail-value price-val">₹{booking.totalAmount?.toLocaleString()}</span></div>
                        <div className="confirm-detail"><span className="detail-label">Status</span><span className="detail-value"><span className="badge badge-green">Confirmed</span></span></div>
                    </div>

                    {points > 0 && (
                        <div className="reward-earned">
                            <span>🎉</span>
                            <div><strong>+{points} reward points earned!</strong><small>Use them on your next booking</small></div>
                        </div>
                    )}

                    <div className="confirm-actions">
                        <Link to="/my-bookings" className="btn-primary">📋 View My Bookings</Link>
                        <Link to="/" className="btn-secondary">🏠 Back to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
