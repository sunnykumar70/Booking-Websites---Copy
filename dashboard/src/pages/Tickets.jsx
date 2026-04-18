import { useState, useEffect } from 'react';
import { getTickets, updateTicketStatus, respondToTicket } from '../api';

export default function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [reply, setReply] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        getTickets().then(res => setTickets(res.data.tickets)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleStatus = async (id, status) => {
        try {
            await updateTicketStatus(id, { status });
            setTickets(prev => prev.map(t => t._id === id ? { ...t, status } : t));
            if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
        } catch (err) { alert('Failed to update status'); }
    };

    const handleReply = async (id) => {
        if (!reply.trim()) return;
        try {
            const res = await respondToTicket(id, { message: reply, isAdmin: true });
            setSelected(res.data.ticket);
            setTickets(prev => prev.map(t => t._id === id ? res.data.ticket : t));
            setReply('');
        } catch { alert('Failed to send reply'); }
    };

    const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);
    const statusBadge = { open: 'badge-blue', 'in-progress': 'badge-yellow', resolved: 'badge-green', closed: 'badge-purple' };
    const priorityBadge = { low: 'badge-green', medium: 'badge-blue', high: 'badge-yellow', urgent: 'badge-red' };

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>🎫 Ticket Management</h1><p>Manage customer support tickets</p></div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['all', 'open', 'in-progress', 'resolved', 'closed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`btn-sm ${filter === f ? 'btn-primary' : ''}`}
                        style={filter !== f ? { background: '#fff', border: '1px solid #e2e8f0', color: '#64748b' } : {}}>
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? tickets.length : tickets.filter(t => t.status === f).length})
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: selected ? '0 0 55%' : '1' }}>
                    <div className="table-container">
                        <table className="data-table">
                            <thead><tr><th>Ticket ID</th><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {loading ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr> :
                                    filtered.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No tickets found</td></tr> :
                                        filtered.map(ticket => (
                                            <tr key={ticket._id} style={{ cursor: 'pointer', background: selected?._id === ticket._id ? '#f8fafc' : '' }} onClick={() => setSelected(ticket)}>
                                                <td><code style={{ fontSize: 11 }}>{ticket.ticketId}</code></td>
                                                <td style={{ fontWeight: 600 }}>{ticket.subject}</td>
                                                <td style={{ textTransform: 'capitalize' }}>{ticket.category}</td>
                                                <td><span className={`badge ${priorityBadge[ticket.priority]}`}>{ticket.priority}</span></td>
                                                <td><span className={`badge ${statusBadge[ticket.status]}`}>{ticket.status}</span></td>
                                                <td>
                                                    <select value={ticket.status} onChange={e => { e.stopPropagation(); handleStatus(ticket._id, e.target.value); }}
                                                        className="form-input" style={{ padding: '4px 8px', fontSize: 11, width: 'auto' }}>
                                                        <option value="open">Open</option>
                                                        <option value="in-progress">In Progress</option>
                                                        <option value="resolved">Resolved</option>
                                                        <option value="closed">Closed</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {selected && (
                    <div style={{ flex: '0 0 43%' }}>
                        <div className="ticket-detail-panel animate-fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontWeight: 700 }}>{selected.subject}</h3>
                                <button onClick={() => setSelected(null)} style={{ color: '#94a3b8', fontSize: 20 }}>✕</button>
                            </div>
                            <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
                                <span className={`badge ${statusBadge[selected.status]}`}>{selected.status}</span>
                                <span className={`badge ${priorityBadge[selected.priority]}`}>{selected.priority}</span>
                                <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{selected.category}</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#64748b', margin: '8px 0' }}>{selected.description}</p>
                            <p style={{ fontSize: 11, color: '#94a3b8' }}>By {selected.user?.name || 'User'} • {new Date(selected.createdAt).toLocaleDateString()}</p>

                            <div className="ticket-thread">
                                {selected.responses?.length === 0 ? <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No replies yet</p> :
                                    selected.responses?.map((r, i) => (
                                        <div key={i} className={`thread-msg ${r.isAdmin ? 'admin' : 'user'}`}>
                                            <div className="msg-bubble"><p>{r.message}</p></div>
                                            <div className="msg-meta">{r.isAdmin ? '👤 Admin' : '🙋 User'} • {new Date(r.createdAt).toLocaleString()}</div>
                                        </div>
                                    ))}
                            </div>

                            <div className="reply-form">
                                <input className="form-input" value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." onKeyDown={e => e.key === 'Enter' && handleReply(selected._id)} />
                                <button className="btn-primary btn-sm" onClick={() => handleReply(selected._id)}>Send</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
