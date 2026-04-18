import { useState, useEffect } from 'react';
import axios from 'axios';
import API, { createDeal, updateDeal, deleteDeal, uploadImage, seedBudgetData } from '../api';

export default function Deals() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        title: '', type: 'flight', from: '', to: '', price: '', originalPrice: '',
        discount: '', duration: '', description: '', image: ''
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            const res = await API.get('/deals?limit=100');
            setDeals(res.data.deals);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
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

            if (editingId) {
                await updateDeal(editingId, { ...form, image: imageUrl });
                alert('Deal updated successfully!');
            } else {
                await createDeal({ ...form, image: imageUrl });
                alert('Deal created successfully!');
            }

            setForm({
                title: '', type: 'flight', from: '', to: '', price: '', originalPrice: '',
                discount: '', duration: '', description: '', image: '', isFeatured: false
            });
            setEditingId(null);
            setFile(null);
            fetchDeals();
        } catch (err) {
            alert('Operation failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (deal) => {
        setEditingId(deal._id);
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

    const cancelEdit = () => {
        setEditingId(null);
        setForm({
            title: '', type: 'flight', from: '', to: '', price: '', originalPrice: '',
            discount: '', duration: '', description: '', image: '', isFeatured: false
        });
        setFile(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this deal?')) return;
        try {
            await deleteDeal(id);
            setDeals(deals.filter(d => d._id !== id));
        } catch (err) {
            alert('Failed to delete deal');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>🏷️ Deals Management</h1>
                    <p>Add and manage travel deals</p>
                </div>
                <button
                    className="btn-secondary"
                    onClick={async () => {
                        if (window.confirm('This will add 50+ budget deals to the system. Continue?')) {
                            try {
                                await seedBudgetData();
                                alert('Budget data seeded successfully!');
                                fetchDeals();
                            } catch (err) {
                                alert('Seeding failed: ' + (err.response?.data?.error || err.message));
                            }
                        }
                    }}
                >
                    🌱 Seed Budget Data
                </button>
            </div>

            <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ flex: 1 }}>
                    <div className="stat-card" style={{ padding: 24, height: 'auto' }}>
                        <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Add New Deal</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="auth-field"><label>Title</label><input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Summer in Goa" /></div>
                                <div className="auth-field"><label>Type</label>
                                    <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                        <option value="flight">Flight</option>
                                        <option value="hotel">Hotel</option>
                                        <option value="bus">Bus</option>
                                        <option value="train">Train</option>
                                    </select>
                                </div>
                                <div className="auth-field"><label>From</label><input className="form-input" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} placeholder="Origin" /></div>
                                <div className="auth-field"><label>To / City</label><input className="form-input" required value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} placeholder="Destination" /></div>
                                <div className="auth-field"><label>Price (₹)</label><input type="number" className="form-input" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                                <div className="auth-field"><label>Original Price (₹)</label><input type="number" className="form-input" required value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} /></div>
                                <div className="auth-field"><label>Discount (%)</label><input type="number" className="form-input" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} /></div>
                                <div className="auth-field"><label>Duration</label><input className="form-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 2h 30m" /></div>
                            </div>
                            <div className="auth-field"><label>Description</label><textarea className="form-input" style={{ height: 80 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea></div>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                                <div className="auth-field" style={{ flex: 1 }}><label>Image Upload</label><input type="file" accept="image/*" onChange={handleFileChange} className="form-input" /></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
                                    <input type="checkbox" id="isFeatured" checked={form.isFeatured || false} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} style={{ width: 18, height: 18 }} />
                                    <label htmlFor="isFeatured" style={{ marginBottom: 0 }}>Featured</label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={uploading}>
                                    {uploading ? 'Processing...' : (editingId ? 'Update Deal' : 'Create Deal')}
                                </button>
                                {editingId && (
                                    <button type="button" className="btn-secondary" onClick={cancelEdit} style={{ flex: 1 }}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div style={{ flex: 1.5 }}>
                    <div className="table-container">
                        <div className="table-header"><h3>Existing Deals ({deals.length})</h3></div>
                        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                            <table className="data-table">
                                <thead><tr><th>Image</th><th>Details</th><th>Price</th><th>Action</th></tr></thead>
                                <tbody>
                                    {loading ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: 20 }}>Loading...</td></tr> :
                                        deals.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: 20 }}>No deals found</td></tr> :
                                            deals.map(deal => (
                                                <tr key={deal._id}>
                                                    <td>
                                                        {deal.image ? <img src={deal.image} alt={deal.title} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} /> : <span style={{ fontSize: 24 }}>🖼️</span>}
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>{deal.title}</div>
                                                        <div style={{ fontSize: 11, color: '#64748b' }}>
                                                            <span className={`badge ${deal.type === 'flight' ? 'badge-blue' : deal.type === 'hotel' ? 'badge-yellow' : deal.type === 'bus' ? 'badge-green' : 'badge-purple'}`} style={{ textTransform: 'capitalize', marginRight: 4 }}>{deal.type}</span>
                                                            {deal.from} → {deal.to}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 700 }}>₹{deal.price}</div>
                                                        <div style={{ fontSize: 11, textDecoration: 'line-through', color: '#94a3b8' }}>₹{deal.originalPrice}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                            <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleEdit(deal)}>Edit</button>
                                                            <button className="btn-danger" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleDelete(deal._id)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
