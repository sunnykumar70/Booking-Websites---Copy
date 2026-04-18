import { useState, useEffect } from 'react';
import './TripSplitter.css';

const CATEGORIES = ['🍽️ Food', '🏨 Stay', '✈️ Travel', '🎡 Activities', '🛒 Shopping', '⛽ Fuel', '🎟️ Entry', '💊 Medical', '📦 Other'];
const COLORS = ['#6366f1','#f97316','#10b981','#3b82f6','#ef4444','#a855f7','#f59e0b','#14b8a6','#ec4899','#06b6d4'];
const AVATARS = ['😀','😎','🤩','🥳','😍','🧑‍💻','👩‍🎤','🧑‍🚀','👩‍🍳','👨‍🎨'];

function uid() { return Math.random().toString(36).slice(2, 9); }

const STORAGE_KEY = 'makeustrip_splitter_v2';

function loadTrips() {
    try { 
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; 
    } catch { return []; }
}

function saveTrips(trips) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

function calcSettlements(members, expenses) {
    const totals = {};
    members.forEach(m => { totals[m.id] = 0; });
    expenses.forEach(e => { if (totals[e.paidBy] !== undefined) totals[e.paidBy] += Number(e.amount); });

    const totalSpent = Object.values(totals).reduce((a, b) => a + b, 0);
    const fairShare = members.length ? totalSpent / members.length : 0;

    const balances = members.map(m => ({ id: m.id, name: m.name, balance: totals[m.id] - fairShare, color: m.color, avatar: m.avatar }));

    // Greedy settlement algo
    const settlements = [];
    const debtors = balances.map(b => ({ ...b })).filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
    const creditors = balances.map(b => ({ ...b })).filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
        const debt = -debtors[i].balance;
        const credit = creditors[j].balance;
        const amount = Math.min(debt, credit);
        settlements.push({ from: debtors[i].name, to: creditors[j].name, amount });
        debtors[i].balance += amount;
        creditors[j].balance -= amount;
        if (Math.abs(debtors[i].balance) < 0.01) i++;
        if (Math.abs(creditors[j].balance) < 0.01) j++;
    }
    return { totals, fairShare, totalSpent, settlements, balances };
}

function exportCsv(trip) {
    const { members, expenses } = trip;
    const { totals, fairShare, totalSpent, settlements, balances } = calcSettlements(members, expenses);

    let csv = `Trip to ${trip.location}\n`;
    csv += `Date,${trip.startDate || 'N/A'} to ${trip.endDate || 'N/A'}\n`;
    csv += `Budget,${trip.budget}\nTotal Spent,${totalSpent}\nFair Share per Person,${fairShare.toFixed(2)}\n\n`;

    csv += `Members,Paid,Balance\n`;
    balances.forEach(b => {
        const paid = totals[b.id] || 0;
        csv += `${b.name},${paid},${b.balance.toFixed(2)}\n`;
    });

    csv += `\nExpenses\nDate,Description,Category,Amount,Paid By\n`;
    expenses.forEach(e => {
        const payer = members.find(m => m.id === e.paidBy)?.name || 'Unknown';
        csv += `${e.date},${e.description.replace(/,/g, '')},${e.category.split(' ')[1] || e.category},${e.amount},${payer}\n`;
    });

    csv += `\nSettlements (Who owes whom)\nFrom,Amount,To\n`;
    settlements.forEach(s => {
        csv += `${s.from},${s.amount.toFixed(2)},${s.to}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `MakeUsTrip_${trip.location.replace(/[^a-z0-9]/gi, '_')}_Expenses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
function Dashboard({ trips, onOpen, onNew, onDelete }) {
    if (trips.length === 0) {
        return (
            <div className="ts-empty animate-fade-in" style={{ padding: '80px 20px' }}>
                <div className="ts-empty-icon">🎒</div>
                <h2>No Trips Yet</h2>
                <p style={{ marginBottom: '24px' }}>Start tracking expenses for your next group adventure!</p>
                <button className="ts-btn-primary" style={{ maxWidth: '240px' }} onClick={onNew}>
                    + Create New Trip
                </button>
            </div>
        );
    }
    return (
        <div className="ts-dashboard animate-fade-in">
            <div className="ts-dash-header">
                <h3>Your Trips</h3>
                <button className="ts-btn-primary small" onClick={onNew}>+ New Trip</button>
            </div>
            <div className="ts-trip-cards">
                {trips.map(trip => {
                    const { totalSpent, fairShare } = calcSettlements(trip.members, trip.expenses);
                    return (
                        <div key={trip.id} className="ts-dash-card">
                            <div className="ts-dash-card-info" onClick={() => onOpen(trip.id)}>
                                <h4>{trip.location}</h4>
                                <p>{trip.startDate} {trip.endDate ? `→ ${trip.endDate}` : ''}</p>
                                <div className="ts-dash-stats">
                                    <span>👥 {trip.members.length} People</span>
                                    <span>💸 ₹{totalSpent.toLocaleString()} Spent</span>
                                </div>
                            </div>
                            <div className="ts-dash-actions">
                                <button className="ts-btn-outline icon-btn" onClick={() => exportCsv(trip)} title="Download CSV">📥</button>
                                <button className="ts-btn-danger icon-btn" onClick={() => onDelete(trip.id)} title="Delete Trip">🗑</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// STEP 1 – Setup
// ─────────────────────────────────────────────
function SetupStep({ onSave, onCancel }) {
    const [setup, setSetup] = useState({ budget: '', numPeople: 4, location: '', startDate: '', endDate: '' });
    const [names, setNames] = useState(['', '', '', '']);
    const s = (f) => (e) => setSetup(p => ({ ...p, [f]: e.target.value }));

    const changeNum = (n) => {
        const count = Math.max(2, Math.min(10, n));
        setSetup(p => ({ ...p, numPeople: count }));
        setNames(arr => {
            const next = [...arr];
            while (next.length < count) next.push('');
            return next.slice(0, count);
        });
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!setup.budget || !setup.location) return;
        const members = names.map((name, i) => ({
            id: uid(),
            name: name.trim() || `Person ${i + 1}`,
            avatar: AVATARS[i % AVATARS.length],
            color: COLORS[i % COLORS.length],
        }));
        const trip = { id: uid(), ...setup, members, expenses: [], createdAt: new Date().toISOString() };
        onSave(trip);
    };

    return (
        <div className="ts-setup animate-fade-in">
            <button className="ts-back-link" onClick={onCancel}>← Back to Trips</button>
            <div className="ts-setup-icon">🌍</div>
            <h2>Plan & Split Your Trip</h2>
            <p>Enter your trip details, add your group members, and we'll handle the math!</p>

            <form onSubmit={handleSave} className="ts-setup-form">
                <div className="ts-form-row">
                    <div className="ts-form-group">
                        <label>📍 Destination *</label>
                        <input type="text" required placeholder="Goa, Bali, Manali…" value={setup.location} onChange={s('location')} />
                    </div>
                    <div className="ts-form-group">
                        <label>💰 Total Budget (₹) *</label>
                        <input type="number" required min="100" placeholder="e.g. 50000" value={setup.budget} onChange={s('budget')} />
                    </div>
                </div>
                <div className="ts-form-row">
                    <div className="ts-form-group">
                        <label>📅 Start Date</label>
                        <input type="date" value={setup.startDate} onChange={s('startDate')} />
                    </div>
                    <div className="ts-form-group">
                        <label>📅 End Date</label>
                        <input type="date" value={setup.endDate} onChange={s('endDate')} />
                    </div>
                </div>

                <div className="ts-form-group">
                    <label>👥 Number of Travelers</label>
                    <div className="ts-num-picker">
                        <button type="button" onClick={() => changeNum(setup.numPeople - 1)}>−</button>
                        <span>{setup.numPeople} People</span>
                        <button type="button" onClick={() => changeNum(setup.numPeople + 1)}>+</button>
                    </div>
                </div>

                <div className="ts-names-grid">
                    {names.map((name, i) => (
                        <div key={i} className="ts-name-input">
                            <span className="ts-name-avatar" style={{ background: COLORS[i % COLORS.length] + '22', border: `2px solid ${COLORS[i % COLORS.length]}` }}>
                                {AVATARS[i % AVATARS.length]}
                            </span>
                            <input
                                type="text"
                                placeholder={`Person ${i + 1}`}
                                value={name}
                                onChange={e => { const nxt = [...names]; nxt[i] = e.target.value; setNames(nxt); }}
                            />
                        </div>
                    ))}
                </div>

                <button type="submit" className="ts-btn-primary">
                    🚀 Start Expense Tracking
                </button>
            </form>
        </div>
    );
}

// ─────────────────────────────────────────────
// PERSON CARD
// ─────────────────────────────────────────────
function PersonCard({ member, paid, fairShare, onAddExpense }) {
    const balance = paid - fairShare;
    const owes = balance < -0.01;
    const owed = balance > 0.01;

    return (
        <div className="ts-person-card" style={{ '--card-color': member.color }}>
            <div className="ts-person-header">
                <div className="ts-avatar" style={{ background: member.color + '22', border: `2.5px solid ${member.color}` }}>
                    {member.avatar}
                </div>
                <div className="ts-person-name">{member.name}</div>
            </div>

            <div className="ts-person-stats">
                <div className="ts-stat">
                    <span className="ts-stat-label">Paid</span>
                    <span className="ts-stat-val paid">₹{paid.toLocaleString()}</span>
                </div>
                <div className="ts-stat">
                    <span className="ts-stat-label">Fair Share</span>
                    <span className="ts-stat-val">₹{fairShare.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
            </div>

            <div className={`ts-balance ${owes ? 'owes' : owed ? 'owed' : 'settled'}`}>
                {owes && <>⬇️ Owes ₹{Math.abs(balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}</>}
                {owed && <>⬆️ Gets ₹{balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</>}
                {!owes && !owed && <>✅ All Settled</>}
            </div>

            <button className="ts-pay-btn" onClick={() => onAddExpense(member.id)}>
                + Add Payment
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────
// ADD EXPENSE MODAL
// ─────────────────────────────────────────────
function AddExpenseModal({ members, defaultPaidBy, onAdd, onClose }) {
    const [form, setForm] = useState({
        description: '',
        amount: '',
        paidBy: defaultPaidBy || members[0]?.id || '',
        category: CATEGORIES[8],
        date: new Date().toISOString().slice(0, 10),
    });
    const s = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.amount || !form.description) return;
        onAdd({ ...form, id: uid(), amount: Number(form.amount) });
    };

    return (
        <div className="ts-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="ts-modal animate-fade-in">
                <div className="ts-modal-head">
                    <h3>💳 Add Expense</h3>
                    <button className="ts-modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="ts-modal-form">
                    <div className="ts-form-group">
                        <label>Category</label>
                        <div className="ts-cat-grid">
                            {CATEGORIES.map(c => (
                                <button key={c} type="button"
                                    className={`ts-cat-btn ${form.category === c ? 'active' : ''}`}
                                    onClick={() => setForm(p => ({ ...p, category: c }))}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="ts-form-row">
                        <div className="ts-form-group">
                            <label>Description *</label>
                            <input type="text" required placeholder="e.g. Hotel dinner" value={form.description} onChange={s('description')} />
                        </div>
                        <div className="ts-form-group">
                            <label>Amount (₹) *</label>
                            <input type="number" required min="1" placeholder="500" value={form.amount} onChange={s('amount')} />
                        </div>
                    </div>

                    <div className="ts-form-row">
                        <div className="ts-form-group">
                            <label>Paid By *</label>
                            <select value={form.paidBy} onChange={s('paidBy')}>
                                {members.map(m => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
                            </select>
                        </div>
                        <div className="ts-form-group">
                            <label>Date</label>
                            <input type="date" value={form.date} onChange={s('date')} />
                        </div>
                    </div>

                    <div className="ts-modal-actions">
                        <button type="button" className="ts-btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="ts-btn-primary">Add Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN SPLITTER (ACTIVE TRIP)
// ─────────────────────────────────────────────
function ActiveTrip({ trip, onUpdate, onBack }) {
    const [expenses, setExpenses] = useState(trip.expenses || []);
    const [showModal, setShowModal] = useState(false);
    const [defaultPaidBy, setDefaultPaidBy] = useState(null);
    const [historyFilter, setHistoryFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('split'); 

    const { members } = trip;
    const { totals, fairShare, totalSpent, settlements, balances } = calcSettlements(members, expenses);

    useEffect(() => {
        onUpdate(trip.id, expenses);
        // eslint-disable-next-line
    }, [expenses]);

    const addExpense = (expense) => {
        setExpenses(prev => [...prev, expense]);
        setShowModal(false);
    };

    const deleteExpense = (id) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const openModal = (memberId = null) => {
        setDefaultPaidBy(memberId);
        setShowModal(true);
    };

    const budgetPercent = Math.min(100, (totalSpent / Number(trip.budget)) * 100);
    const budgetLeft = Number(trip.budget) - totalSpent;
    const overBudget = budgetLeft < 0;

    const filteredExpenses = historyFilter === 'all'
        ? expenses
        : expenses.filter(e => e.paidBy === historyFilter);

    return (
        <div className="ts-active animate-fade-in">
            {/* Trip Header */}
            <div className="ts-trip-header">
                <div className="ts-trip-meta">
                    <button className="ts-back-link" onClick={onBack}>← All Trips</button>
                    <div className="ts-trip-loc">📍 {trip.location}</div>
                    <div className="ts-trip-dates">
                        {trip.startDate && trip.endDate ? `${trip.startDate} → ${trip.endDate}` : ''}
                    </div>
                </div>
                <div className="ts-trip-actions">
                    <button className="ts-btn-outline small" onClick={() => exportCsv({ ...trip, expenses })}>📥 Export CSV</button>
                    <button className="ts-btn-primary small" onClick={() => openModal()}>+ Add Expense</button>
                </div>
            </div>

            {/* Budget Bar */}
            <div className="ts-budget-box">
                <div className="ts-budget-info">
                    <span className="ts-budget-label">Budget</span>
                    <span className="ts-budget-total">₹{Number(trip.budget).toLocaleString()}</span>
                    <span className={`ts-budget-left ${overBudget ? 'over' : ''}`}>
                        {overBudget
                            ? `⚠️ Over by ₹${Math.abs(budgetLeft).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                            : `₹${budgetLeft.toLocaleString(undefined, { maximumFractionDigits: 0 })} remaining`}
                    </span>
                </div>
                <div className="ts-budget-track">
                    <div className="ts-budget-fill" style={{ width: `${budgetPercent}%`, background: overBudget ? '#ef4444' : undefined }} />
                </div>
                <div className="ts-budget-stats">
                    <span>Total Spent: <strong>₹{totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></span>
                    <span>Per Person: <strong>₹{fairShare.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></span>
                    <span>Expenses: <strong>{expenses.length}</strong></span>
                </div>
            </div>

            {/* Tabs */}
            <div className="ts-tabs">
                {[['split', '👥 Split'], ['history', '📋 History'], ['settle', '💸 Settle Up']].map(([k, label]) => (
                    <button key={k} className={`ts-tab ${activeTab === k ? 'active' : ''}`} onClick={() => setActiveTab(k)}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ── TAB: SPLIT ── */}
            {activeTab === 'split' && (
                <div className="ts-tab-panel animate-fade-in">
                    {expenses.length === 0 ? (
                        <div className="ts-empty">
                            <div className="ts-empty-icon">💰</div>
                            <p>No expenses yet! Click <strong>"+ Add Expense"</strong> to start tracking.</p>
                        </div>
                    ) : (
                        <div className="ts-persons-grid">
                            {members.map(m => (
                                <PersonCard
                                    key={m.id}
                                    member={m}
                                    paid={totals[m.id] || 0}
                                    fairShare={fairShare}
                                    onAddExpense={openModal}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB: HISTORY ── */}
            {activeTab === 'history' && (
                <div className="ts-tab-panel animate-fade-in">
                    <div className="ts-history-filter">
                        <button className={`ts-filter-btn ${historyFilter === 'all' ? 'active' : ''}`} onClick={() => setHistoryFilter('all')}>All</button>
                        {members.map(m => (
                            <button key={m.id} className={`ts-filter-btn ${historyFilter === m.id ? 'active' : ''}`} onClick={() => setHistoryFilter(m.id)}>
                                {m.avatar} {m.name}
                            </button>
                        ))}
                    </div>
                    {filteredExpenses.length === 0 ? (
                        <div className="ts-empty"><div className="ts-empty-icon">📋</div><p>No expenses to show.</p></div>
                    ) : (
                        <div className="ts-expense-list">
                            {[...filteredExpenses].reverse().map(exp => {
                                const payer = members.find(m => m.id === exp.paidBy);
                                return (
                                    <div key={exp.id} className="ts-expense-item">
                                        <div className="ts-exp-icon">{exp.category.slice(0, 2)}</div>
                                        <div className="ts-exp-info">
                                            <div className="ts-exp-name">{exp.description}</div>
                                            <div className="ts-exp-meta">
                                                <span style={{ color: payer?.color }}>Paid by {payer?.name}</span>
                                                <span>·</span>
                                                <span>{exp.date}</span>
                                                <span>·</span>
                                                <span>{exp.category}</span>
                                            </div>
                                        </div>
                                        <div className="ts-exp-amount">₹{Number(exp.amount).toLocaleString()}</div>
                                        <button className="ts-exp-delete" onClick={() => deleteExpense(exp.id)} title="Delete">🗑</button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB: SETTLE UP ── */}
            {activeTab === 'settle' && (
                <div className="ts-tab-panel animate-fade-in">
                    {settlements.length === 0 ? (
                        <div className="ts-empty">
                            <div className="ts-empty-icon">🎉</div>
                            <h4>All Settled!</h4>
                            <p>Everyone has paid their fair share. No transfers needed.</p>
                        </div>
                    ) : (
                        <div className="ts-settlements">
                            <p className="ts-settle-intro">To settle all debts, these transfers need to be made:</p>
                            {settlements.map((s, i) => {
                                const fromM = members.find(m => m.name === s.from);
                                const toM = members.find(m => m.name === s.to);
                                return (
                                    <div key={i} className="ts-settlement-item">
                                        <div className="ts-settle-from" style={{ color: fromM?.color }}>{fromM?.avatar} {s.from}</div>
                                        <div className="ts-settle-arrow">
                                            <span className="ts-settle-amount">₹{s.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                            <span>→</span>
                                        </div>
                                        <div className="ts-settle-to" style={{ color: toM?.color }}>{toM?.avatar} {s.to}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Premium Balance Summary Cards */}
                    <div className="ts-balance-summary">
                        <h4>Balance Summary</h4>
                        <div className="ts-balance-cards">
                            {balances.map(b => (
                                <div key={b.id} className="ts-bal-card" style={{ '--card-color': b.color }}>
                                    <div className="ts-bal-card-header">
                                        <span className="ts-bal-avatar">{b.avatar}</span>
                                        <span className="ts-bal-name">{b.name}</span>
                                    </div>
                                    <div className="ts-bal-card-body">
                                        <div className="ts-bal-share">
                                            <span>Paid: ₹{(totals[b.id]||0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className={`ts-bal-result ${b.balance >= 0 ? 'positive' : 'negative'}`}>
                                            {b.balance >= 0 
                                                ? `+ ₹${b.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}` 
                                                : `- ₹${Math.abs(b.balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                        </div>
                                        <div className="ts-bal-desc">
                                            {b.balance >= 0 ? 'Owed to them' : 'They owe'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Expense Modal */}
            {showModal && (
                <AddExpenseModal
                    members={members}
                    defaultPaidBy={defaultPaidBy}
                    onAdd={addExpense}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// ROOT EXPORT
// ─────────────────────────────────────────────
export default function TripSplitter() {
    const [trips, setTrips] = useState(() => loadTrips());
    const [activeTripId, setActiveTripId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Initial migration: If the old V1 state array exists, merge it or at least ensure trips is an array.
    useEffect(() => {
        saveTrips(trips);
    }, [trips]);

    const handleCreateTrip = (newTrip) => {
        setTrips(prev => [newTrip, ...prev]);
        setIsCreating(false);
        setActiveTripId(newTrip.id);
    };

    const handleUpdateExpenses = (id, expenses) => {
        setTrips(prev => prev.map(t => t.id === id ? { ...t, expenses } : t));
    };

    const handleDeleteTrip = (id) => {
        if (!window.confirm('Delete this trip from history? This action cannot be undone.')) return;
        setTrips(prev => prev.filter(t => t.id !== id));
        if (activeTripId === id) setActiveTripId(null);
    };

    const activeTrip = trips.find(t => t.id === activeTripId);

    return (
        <section className="ts-section">
            <div className="ts-section-header">
                <h2>💸 Group Expense Splitter</h2>
                <p>Track who paid what, split equally, and settle up instantly</p>
            </div>
            <div className="ts-container">
                {activeTrip ? (
                    <ActiveTrip 
                        trip={activeTrip} 
                        onUpdate={handleUpdateExpenses} 
                        onBack={() => setActiveTripId(null)} 
                    />
                ) : isCreating ? (
                    <SetupStep 
                        onSave={handleCreateTrip} 
                        onCancel={() => setIsCreating(false)} 
                    />
                ) : (
                    <Dashboard 
                        trips={trips} 
                        onOpen={setActiveTripId} 
                        onNew={() => setIsCreating(true)} 
                        onDelete={handleDeleteTrip} 
                    />
                )}
            </div>
        </section>
    );
}
