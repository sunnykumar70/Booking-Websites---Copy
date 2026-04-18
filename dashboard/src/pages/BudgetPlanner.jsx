import { useState, useEffect } from 'react';
import API, { updateDeal, deleteDeal, seedBudgetData } from '../api';

export default function BudgetPlanner() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingDeal, setEditingDeal] = useState(null);
    const [form, setForm] = useState({
        title: '', type: 'flight', from: '', to: '', price: '', originalPrice: '',
        discount: '', duration: '', description: '', image: '', isFeatured: false
    });

    useEffect(() => {
        fetchBudgetDeals();
    }, []);

    const fetchBudgetDeals = async () => {
        try {
            const res = await API.get('/deals?isBudget=true&limit=100');
            setDeals(res.data.deals);
        } catch (err) {
            console.error('Failed to fetch budget deals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (deal) => {
        setEditingDeal(deal);
        setForm({
            title: deal.title || '',
            type: deal.type || 'flight',
            from: deal.from || '',
            to: deal.to || '',
            price: deal.price || '',
            originalPrice: deal.originalPrice || '',
            discount: deal.discount || '',
            duration: deal.duration || '',
            description: deal.description || '',
            image: deal.image || '',
            isFeatured: deal.isFeatured || false
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this budget trip?')) return;
        try {
            await deleteDeal(id);
            setDeals(deals.filter(d => d._id !== id));
        } catch (err) {
            alert('Failed to delete deal');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateDeal(editingDeal._id, form);
            alert('Budget trip updated successfully!');
            setEditingDeal(null);
            fetchBudgetDeals();
        } catch (err) {
            alert('Update failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleSeed = async () => {
        if (window.confirm('This will add the full budget dataset. Continue?')) {
            try {
                setLoading(true);
                await seedBudgetData();
                alert('Budget dataset seeded successfully!');
                fetchBudgetDeals();
            } catch (err) {
                alert('Seeding failed');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>🎒 Budget Planner Management</h1>
                    <p>Manage destinations and deals for the budget trip planner</p>
                </div>
                <button className="btn-primary" onClick={handleSeed}>
                    🌱 Seed Budget Dataset
                </button>
            </div>

            {editingDeal && (
                <div className="stat-card" style={{ marginBottom: 24, padding: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>Edit Budget Trip: {editingDeal.title}</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="auth-field"><label>Title</label><input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                            <div className="auth-field"><label>Type</label>
                                <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="flight">Flight</option>
                                    <option value="hotel">Hotel</option>
                                    <option value="bus">Bus</option>
                                    <option value="train">Train</option>
                                </select>
                            </div>
                            <div className="auth-field"><label>From</label><input className="form-input" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} /></div>
                            <div className="auth-field"><label>To / City</label><input className="form-input" required value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} /></div>
                            <div className="auth-field"><label>Price (₹)</label><input type="number" className="form-input" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                            <div className="auth-field"><label>Original Price (₹)</label><input type="number" className="form-input" required value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} /></div>
                            <div className="auth-field"><label>Image URL</label><input className="form-input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://unsplash.com/..." /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                            <button type="submit" className="btn-primary">Update Changes</button>
                            <button type="button" className="btn-secondary" onClick={() => setEditingDeal(null)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                <div className="table-header">
                    <h3>Budget Trip Options ({deals.length})</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Type</th>
                            <th>Details</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: 40 }}>Loading trips...</td></tr>
                        ) : deals.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: 40 }}>No budget trips found. Use the Seed button to add data.</td></tr>
                        ) : (
                            deals.map(deal => (
                                <tr key={deal._id}>
                                    <td>
                                        {deal.image ? <img src={deal.image} alt={deal.title} style={{ width: 50, height: 35, objectFit: 'cover', borderRadius: 4 }} /> : <span style={{ fontSize: 20 }}>🖼️</span>}
                                    </td>
                                    <td>
                                        <span className={`badge ${deal.type === 'flight' ? 'badge-blue' : deal.type === 'hotel' ? 'badge-yellow' : deal.type === 'bus' ? 'badge-green' : 'badge-purple'}`}>
                                            {deal.type}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{deal.title}</div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>
                                            {deal.type === 'hotel' ? deal.city : `${deal.from} → ${deal.to}`}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>₹{deal.price}</div>
                                        <div style={{ fontSize: 11, textDecoration: 'line-through', color: '#94a3b8' }}>₹{deal.originalPrice}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn-primary btn-sm" onClick={() => handleEdit(deal)}>Edit</button>
                                            <button className="btn-danger btn-sm" onClick={() => handleDelete(deal._id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
