import { useState, useEffect } from 'react';
import { getUsers } from '../api';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        getUsers().then(res => setUsers(res.data.users)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
    const tierBadge = { Bronze: 'badge-yellow', Silver: 'badge-blue', Gold: 'badge-purple', Platinum: 'badge-green' };

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>👥 User Management</h1><p>View and manage registered users</p></div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <input className="form-input" style={{ maxWidth: 320 }} placeholder="Search users by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Total: <strong>{users.length}</strong></span>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead><tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Tier</th><th>Reward Points</th><th>Joined</th></tr></thead>
                    <tbody>
                        {loading ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr> :
                            filtered.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>No users found</td></tr> :
                                filtered.map(user => (
                                    <tr key={user._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 32, height: 32, background: '#6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>{user.name?.charAt(0).toUpperCase()}</div>
                                                <span style={{ fontWeight: 600 }}>{user.name}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || '-'}</td>
                                        <td><span className={`badge ${user.role === 'admin' ? 'badge-red' : 'badge-green'}`}>{user.role}</span></td>
                                        <td><span className={`badge ${tierBadge[user.tier] || 'badge-yellow'}`}>{user.tier || 'Bronze'}</span></td>
                                        <td style={{ fontWeight: 600 }}>{user.rewardPoints || 0}</td>
                                        <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
