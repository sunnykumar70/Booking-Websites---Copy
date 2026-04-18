import { useState, useEffect } from 'react';
import API, { updateDeal, deleteDeal, seedBudgetData, uploadImage } from '../api';

export default function BudgetRoutes() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingDeal, setEditingDeal] = useState(null);
    const [file, setFile] = useState(null);
    const [form, setForm] = useState({
        title: '', type: 'flight', from: '', to: '', price: '', originalPrice: '',
        image: '', operator: '', classType: '', duration: ''
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
            image: deal.image || '',
            operator: deal.operator || '',
            classType: deal.classType || '',
            duration: deal.duration || ''
        });
        setFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this route?')) return;
        try {
            await deleteDeal(id);
            setDeals(deals.filter(d => d._id !== id));
        } catch (err) {
            alert('Failed to delete route');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let imageUrl = form.image;
            if (file) {
                const formData = new FormData();
                formData.append('image', file);
                const uploadRes = await uploadImage(formData);
                imageUrl = uploadRes.data.url;
            }

            const routeData = { ...form, image: imageUrl, isBudget: true, isActive: true };

            if (editingDeal) {
                await updateDeal(editingDeal._id, routeData);
                alert('Route updated!');
            } else {
                await API.post('/deals', routeData);
                alert('Route added!');
            }
            setEditingDeal(null);
            setForm({ title: '', type: 'flight', from: '', to: '', price: '', originalPrice: '', image: '', operator: '', classType: '', duration: '' });
            setFile(null);
            fetchBudgetDeals();
        } catch (err) {
            alert('Operation failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>🛣️ Budget Routes (Transport/Hotels)</h1>
                    <p>Manage flights, trains, buses, and hotels for budget destinations</p>
                </div>
                <button className="btn-primary" onClick={async () => { if (confirm('Seed all budget data?')) { await seedBudgetData(); fetchBudgetDeals(); } }}>
                    🌱 Seed Budget Architecture
                </button>
            </div>

            <div className="stat-card" style={{ marginBottom: 24, padding: 24 }}>
                <h3 style={{ marginBottom: 16 }}>{editingDeal ? 'Edit Route' : 'Add New Route'}</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        <div className="auth-field"><label>Title</label><input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                        <div className="auth-field"><label>Type</label>
                            <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <option value="flight">Flight</option>
                                <option value="train">Train</option>
                                <option value="bus">Bus</option>
                                <option value="hotel">Hotel</option>
                            </select>
                        </div>
                        <div className="auth-field"><label>Destination (To/City)</label><input className="form-input" required value={form.to || form.city} onChange={e => setForm({ ...form, to: e.target.value, city: e.target.value })} /></div>
                        <div className="auth-field"><label>From</label><input className="form-input" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} /></div>
                        <div className="auth-field"><label>Price (₹)</label><input type="number" className="form-input" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                        <div className="auth-field">
                            <label>Route/Place Image (File)</label>
                            <input type="file" className="form-input" accept="image/*" onChange={e => setFile(e.target.files[0])} />
                            {form.image && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 4 }}>Current: {form.image.split('/').pop()}</p>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button type="submit" className="btn-primary" disabled={uploading}>
                            {uploading ? 'Uploading...' : (editingDeal ? 'Update Route' : 'Add Route')}
                        </button>
                        {editingDeal && <button type="button" className="btn-secondary" onClick={() => { setEditingDeal(null); setForm({ title: '', type: 'flight', from: '', to: '', price: '', originalPrice: '', image: '', operator: '', classType: '', duration: '' }); setFile(null); }}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Details</th>
                            <th>Destination</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5">Loading...</td></tr>
                        ) : deals.map(deal => (
                            <tr key={deal._id}>
                                <td><span className={`badge badge-${deal.type === 'flight' ? 'blue' : deal.type === 'hotel' ? 'yellow' : 'purple'}`}>{deal.type}</span></td>
                                <td><div style={{ fontWeight: 600 }}>{deal.title}</div></td>
                                <td>{deal.to || deal.city}</td>
                                <td>₹{deal.price}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn-primary btn-sm" onClick={() => handleEdit(deal)}>Edit</button>
                                        <button className="btn-danger btn-sm" onClick={() => handleDelete(deal._id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
