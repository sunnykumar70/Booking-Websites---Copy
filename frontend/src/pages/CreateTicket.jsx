import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createTicket } from '../api';
import BackButton from '../components/BackButton';
import './CreateTicket.css';

export default function CreateTicket() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ subject: '', description: '', category: 'booking', priority: 'medium', bookingRef: '' });
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        setLoading(true);
        try {
            const res = await createTicket(form);
            setCreated(res.data.ticket);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create ticket');
        } finally { setLoading(false); }
    };

    if (created) {
        return (
            <div className="ticket-page">
                <div className="container">
                    <div className="ticket-success card-static animate-fade-in">
                        <div className="success-icon">🎫</div>
                        <h2>Ticket Created!</h2>
                        <p>Your support ticket has been submitted successfully.</p>
                        <div className="ticket-ref"><span>Ticket ID</span><strong>{created.ticketId}</strong></div>
                        <p style={{ color: '#6b7280', fontSize: 14 }}>Our team will respond within 24 hours. You can track the status of your ticket in the admin dashboard.</p>
                        <div className="confirm-actions" style={{ marginTop: 20 }}>
                            <button className="btn-primary" onClick={() => { setCreated(null); setForm({ subject: '', description: '', category: 'booking', priority: 'medium', bookingRef: '' }); }}>Create Another</button>
                            <button className="btn-secondary" onClick={() => navigate('/')}>Back to Home</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ticket-page">
            <div className="container">
                <BackButton />
                <div className="ticket-layout">
                    <div className="ticket-form-card card-static animate-fade-in">
                        <h2>🎫 Raise a Support Ticket</h2>
                        <p className="ticket-subtitle">Need help? Our team is here to assist you.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="auth-field">
                                <label>Subject *</label>
                                <input className="form-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required placeholder="Brief description of your issue" />
                            </div>
                            <div className="form-grid" style={{ marginBottom: 0 }}>
                                <div className="auth-field">
                                    <label>Category</label>
                                    <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option value="booking">Booking Issue</option>
                                        <option value="payment">Payment Problem</option>
                                        <option value="refund">Refund Request</option>
                                        <option value="technical">Technical Issue</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="auth-field">
                                    <label>Priority</label>
                                    <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div className="auth-field">
                                <label>Booking Reference (optional)</label>
                                <input className="form-input" value={form.bookingRef} onChange={e => setForm({ ...form, bookingRef: e.target.value })} placeholder="MUT-XXXXXXXX" />
                            </div>
                            <div className="auth-field">
                                <label>Description *</label>
                                <textarea className="form-input" rows="5" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="Please describe your issue in detail..." />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14 }} disabled={loading}>{loading ? 'Submitting...' : 'Submit Ticket'}</button>
                        </form>
                    </div>

                    <div className="ticket-info">
                        <div className="info-card card-static">
                            <h4>📞 Contact Info</h4>
                            <p>Email: support@makeustrip.com</p>
                            <p>Phone: 1800-123-4567</p>
                            <p>Available 24/7</p>
                        </div>
                        <div className="info-card card-static">
                            <h4>⏱️ Response Time</h4>
                            <p><strong>Urgent:</strong> Within 2 hours</p>
                            <p><strong>High:</strong> Within 6 hours</p>
                            <p><strong>Medium:</strong> Within 24 hours</p>
                            <p><strong>Low:</strong> Within 48 hours</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
