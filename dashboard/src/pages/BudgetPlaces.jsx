import { useState, useEffect } from 'react';
import API, { uploadImage } from '../api';

export default function BudgetPlaces() {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingPlace, setEditingPlace] = useState(null);
    const [file, setFile] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', image: '', startingPrice: '' });

    useEffect(() => {
        fetchPlaces();
    }, []);

    const fetchPlaces = async () => {
        try {
            const res = await API.get('/destinations');
            setPlaces(res.data.destinations);
        } catch (err) {
            console.error('Failed to fetch places:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (place) => {
        setEditingPlace(place);
        setForm({
            name: place.name,
            description: place.description,
            image: place.image,
            startingPrice: place.startingPrice
        });
        setFile(null); // Reset file on edit
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this place?')) return;
        try {
            await API.delete(`/destinations/${id}`);
            setPlaces(places.filter(p => p._id !== id));
        } catch (err) {
            alert('Failed to delete place');
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

            const startingPrice = parseFloat(form.startingPrice);
            const placeData = { ...form, startingPrice, image: imageUrl };

            if (editingPlace) {
                await API.put(`/destinations/${editingPlace._id}`, placeData);
                alert('Place updated!');
            } else {
                await API.post('/destinations', placeData);
                alert('Place added!');
            }
            setEditingPlace(null);
            setForm({ name: '', description: '', image: '', startingPrice: '' });
            setFile(null);
            fetchPlaces();
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
                    <h1>📍 Budget Places</h1>
                    <p>Manage destinations displayed in the Budget Trip Planner</p>
                </div>
            </div>

            <div className="stat-card" style={{ marginBottom: 24, padding: 24 }}>
                <h3 style={{ marginBottom: 16 }}>{editingPlace ? 'Edit Place' : 'Add New Place'}</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="auth-field"><label>Destination Name</label><input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                        <div className="auth-field"><label>Starting Price (₹)</label><input type="number" className="form-input" required value={form.startingPrice} onChange={e => setForm({ ...form, startingPrice: e.target.value })} /></div>
                        <div className="auth-field" style={{ gridColumn: 'span 2' }}>
                            <label>Destination Image (File)</label>
                            <input type="file" className="form-input" accept="image/*" onChange={e => setFile(e.target.files[0])} />
                            {form.image && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 4 }}>Current image: {form.image.split('/').pop()}</p>}
                        </div>
                        <div className="auth-field" style={{ gridColumn: 'span 2' }}><label>Description</label><textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="3"></textarea></div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button type="submit" className="btn-primary" disabled={uploading}>
                            {uploading ? 'Processing...' : (editingPlace ? 'Update Place' : 'Add Place')}
                        </button>
                        {editingPlace && <button type="button" className="btn-secondary" onClick={() => { setEditingPlace(null); setForm({ name: '', description: '', image: '', startingPrice: '' }); setFile(null); }}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Starting Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4">Loading...</td></tr>
                        ) : places.map(place => (
                            <tr key={place._id}>
                                <td><img src={place.image} alt={place.name} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} /></td>
                                <td><div style={{ fontWeight: 600 }}>{place.name}</div></td>
                                <td>₹{place.startingPrice}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn-primary btn-sm" onClick={() => handleEdit(place)}>Edit</button>
                                        <button className="btn-danger btn-sm" onClick={() => handleDelete(place._id)}>Delete</button>
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
