import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDeals } from '../api';
import BudgetPlanner from '../components/BudgetPlanner';
import './Home.css';

export default function Home() {
    const [tab, setTab] = useState('flights');
    const [deals, setDeals] = useState({ flights: [], hotels: [], buses: [], trains: [] });
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Search form state
    const [form, setForm] = useState({ from: '', to: '', city: '', date: '', returnDate: '', travelers: '1 Adult, Economy', groupSize: '10-20' });

    useEffect(() => {
        const t = searchParams.get('tab');
        if (t) setTab(t);
    }, [searchParams]);

    useEffect(() => {
        const keyMap = { flight: 'flights', hotel: 'hotels', bus: 'buses', train: 'trains' };
        ['flight', 'hotel', 'bus', 'train'].forEach(type => {
            getDeals({ type, limit: 5 }).then(res => {
                setDeals(prev => ({ ...prev, [keyMap[type]]: res.data.deals }));
            }).catch(() => { });
        });
    }, []);

    const handleSearch = () => {
        if (tab === 'group') {
            navigate('/group-trip');
            return;
        }
        const params = new URLSearchParams();
        if (tab !== 'all') {
            params.set('type', tab === 'hotels' ? 'hotel' : tab.slice(0, -1));
        }
        if (form.from) params.set('from', form.from);
        if (form.to) params.set('to', form.to);
        if (form.city) params.set('city', form.city);
        navigate(`/search?${params.toString()}`);
    };

    return (
        <div className="home">
            {/* Hero */}
            <section className="hero">
                <div className="container hero-content">
                    <h1 className="hero-title animate-slide-up">Your Journey Begins Here</h1>
                    <p className="hero-subtitle">Search flights, hotels, buses & trains at best prices</p>

                    <div className="search-card animate-fade-in">
                        <div className="search-tabs">
                            {['all', 'flights', 'hotels', 'buses', 'trains', 'group'].map(t => (
                                <button key={t} className={`search-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                                    {t === 'all' ? '🔍' : t === 'flights' ? '✈️' : t === 'hotels' ? '🏨' : t === 'buses' ? '🚌' : t === 'trains' ? '🚆' : '👥'} {t === 'group' ? 'Group Trip' : t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="search-form">
                            {tab === 'hotels' ? (
                                <div className="search-grid search-grid-4">
                                    <div className="search-field">
                                        <label>City / Area</label>
                                        <input type="text" placeholder="Goa" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="form-input" />
                                    </div>
                                    <div className="search-field"><label>Check-in</label><input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                                    <div className="search-field"><label>Check-out</label><input type="date" className="form-input" value={form.returnDate} onChange={e => setForm({ ...form, returnDate: e.target.value })} /></div>
                                    <div className="search-field"><label>&nbsp;</label><button className="btn-primary search-btn" onClick={handleSearch}>🔍 Search</button></div>
                                </div>
                            ) : tab === 'group' ? (
                                <div className="search-grid search-grid-4">
                                    <div className="search-field">
                                        <label>Destination</label>
                                        <input type="text" placeholder="Goa, Thailand, etc." value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} className="form-input" />
                                    </div>
                                    <div className="search-field">
                                        <label>Travel Date</label>
                                        <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                    </div>
                                    <div className="search-field">
                                        <label>Group Size</label>
                                        <select className="form-input" value={form.groupSize} onChange={e => setForm({ ...form, groupSize: e.target.value })}>
                                            <option>10-20 People</option>
                                            <option>20-50 People</option>
                                            <option>50+ People</option>
                                        </select>
                                    </div>
                                    <div className="search-field">
                                        <label>&nbsp;</label>
                                        <button className="btn-primary search-btn" onClick={handleSearch}>Get Group Quote →</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="search-grid search-grid-5">
                                    <div className="search-field"><label>{tab === 'all' ? 'Destination' : 'From'}</label><input type="text" placeholder={tab === 'all' ? 'Goa, Mumbai...' : 'Delhi'} value={tab === 'all' ? form.to : form.from} onChange={e => setForm({ ...form, [tab === 'all' ? 'to' : 'from']: e.target.value })} className="form-input" /></div>
                                    {tab !== 'all' && <div className="search-field"><label>To</label><input type="text" placeholder="Mumbai" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} className="form-input" /></div>}
                                    <div className="search-field"><label>Date</label><input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                                    <div className="search-field"><label>Travelers</label><select className="form-input" value={form.travelers} onChange={e => setForm({ ...form, travelers: e.target.value })}><option>1 Adult, Economy</option><option>2 Adults, Economy</option><option>1 Adult, Business</option></select></div>
                                    <div className="search-field"><label>&nbsp;</label><button className="btn-primary search-btn" onClick={handleSearch}>🔍 Search</button></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <BudgetPlanner />
                </div>
            </section>

            {/* Benefits */}
            <section className="benefits">
                <div className="container benefits-inner">
                    <div className="benefit">✅ 24/7 Customer Support</div>
                    <div className="benefit">✅ Easy Cancellations</div>
                    <div className="benefit">✅ Secure Payments</div>
                    <div className="benefit">✅ Best Price Guarantee</div>
                </div>
            </section>

            {/* Price Tracker */}
            <section className="section price-tracker-section">
                <div className="container">
                    <h2 className="section-title">📊 Smart Price Tracker</h2>
                    <p className="section-subtitle">Get notified when prices drop on your favorite routes</p>
                    <div className="price-tracker-grid">
                        <div className="card" style={{ padding: 24 }}>
                            <div className="tracker-header"><span className="tracker-icon" style={{ background: '#dcfce7' }}>📉</span><div><strong>Delhi → Mumbai</strong><small>Price dropped by ₹800</small></div></div>
                            <div className="tracker-prices"><div><small>Was ₹4,200</small><div className="price-big green">₹2,499</div></div><div style={{ textAlign: 'right' }}><small>Savings</small><div className="price-big green">40%</div></div></div>
                            <button className="btn-accent">🔔 Set Price Alert</button>
                        </div>
                        <div className="card" style={{ padding: 24 }}>
                            <div className="tracker-header"><span className="tracker-icon" style={{ background: '#dbeafe' }}>📈</span><div><strong>Goa Hotels</strong><small>Trending up</small></div></div>
                            <div className="demand-bar"><div className="demand-labels"><span>Low</span><span>High</span></div><div className="demand-track"><div className="demand-fill" style={{ width: '75%' }}></div></div><small style={{ color: '#ea580c' }}>Book now before prices increase!</small></div>
                            <button className="btn-accent" style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>🔔 Set Price Alert</button>
                        </div>
                        <div className="card" style={{ padding: 24 }}>
                            <div className="tracker-header"><span className="tracker-icon" style={{ background: '#f3e8ff' }}>⚡</span><div><strong>Your Active Alerts</strong><small>3 routes monitored</small></div></div>
                            <div className="alert-list"><div className="alert-item"><span>✈️ BLR → DEL</span><span className="badge badge-green">Active</span></div><div className="alert-item"><span>🏨 Manali</span><span className="badge badge-green">Active</span></div><div className="alert-item"><span>🚌 DEL → JAI</span><span className="badge badge-green">Active</span></div></div>
                            <button className="btn-accent" style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}>Manage Alerts</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Rewards */}
            <section className="section rewards-section">
                <div className="container">
                    <div className="rewards-banner">
                        <div className="rewards-deco1"></div>
                        <div className="rewards-deco2"></div>
                        <div className="rewards-content">
                            <div className="rewards-main">
                                <div className="rewards-left">
                                    <h2>💎 TripRewards Club</h2>
                                    <p>Earn points on every booking and unlock exclusive benefits!</p>
                                    <div className="rewards-stats">
                                        <div className="reward-stat"><div className="reward-val">2X</div><small>Points on Flights</small></div>
                                        <div className="reward-stat"><div className="reward-val">3X</div><small>Points on Hotels</small></div>
                                        <div className="reward-stat"><div className="reward-val">5%</div><small>Instant Cashback</small></div>
                                        <div className="reward-stat"><div className="reward-val">FREE</div><small>Priority Support</small></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* Travel Stories Preview */}
            <section className="section stories-preview-section">
                <div className="container">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="section-title" style={{ textAlign: 'left', margin: 0 }}>📸 Travel Stories</h2>
                            <p className="section-subtitle" style={{ textAlign: 'left', margin: '8px 0 0' }}>Share your journey, inspire others</p>
                        </div>
                        <button className="btn-outline" onClick={() => navigate('/community')}>Explore All Stories →</button>
                    </div>
                    <div className="stories-preview-grid">
                        <div className="story-preview-card" onClick={() => navigate('/community')}>
                            <div className="preview-media" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=400)' }}></div>
                            <div className="preview-info">
                                <h3>Paradise in Maldives</h3>
                                <p>By Sarah Miller • 5 ★</p>
                            </div>
                        </div>
                        <div className="story-preview-card" onClick={() => navigate('/community')}>
                            <div className="preview-media" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400)' }}></div>
                            <div className="preview-info">
                                <h3>Swiss Alps Magic</h3>
                                <p>By David Chen • 5 ★</p>
                            </div>
                        </div>
                        <div className="story-preview-card" onClick={() => navigate('/community')}>
                            <div className="preview-media" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1503899036084-755c48bb4168?auto=format&fit=crop&w=400)' }}></div>
                            <div className="preview-info">
                                <h3>Tokyo Street Food</h3>
                                <p>By Elena R. • 4 ★</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Deals */}
            <section className="section">
                <div className="container">
                    {/* Flight Deals */}
                    <div className="deals-section">
                        <div className="deals-header"><h2>✈️ Popular Flight Deals</h2><button className="view-all" onClick={() => navigate('/search?type=flight')}>View All →</button></div>
                        <div className="deals-scroll hide-scrollbar">
                            {deals.flights.map(deal => (
                                <div key={deal._id} className="deal-card card" onClick={() => navigate('/booking', { state: { deal } })}>
                                    <div className="deal-image" style={deal.image ? { backgroundImage: `url(${deal.image})`, backgroundSize: 'cover' } : { background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
                                        {!deal.image && <span className="deal-emoji">🛫</span>}
                                    </div>
                                    <div className="deal-info"><div className="deal-route">{deal.from} <span>→</span> {deal.to}</div><p className="deal-meta">{deal.stops} • {deal.duration}</p><div className="deal-pricing"><span className="deal-price">₹{deal.price.toLocaleString()}</span><span className="deal-original">₹{deal.originalPrice.toLocaleString()}</span></div></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hotel Deals */}
                    <div className="deals-section">
                        <div className="deals-header"><h2>🏨 Top Hotel Destinations</h2><button className="view-all" onClick={() => navigate('/search?type=hotel')}>View All →</button></div>
                        <div className="deals-scroll hide-scrollbar">
                            {deals.hotels.map(deal => (
                                <div key={deal._id} className="deal-card card" onClick={() => navigate('/booking', { state: { deal } })}>
                                    <div className="deal-image" style={deal.image ? { backgroundImage: `url(${deal.image})`, backgroundSize: 'cover' } : { background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                                        {!deal.image && <span className="deal-emoji">🏖️</span>}
                                        <span className="deal-badge">{deal.discount}% OFF</span>
                                    </div>
                                    <div className="deal-info"><h3>{deal.city}</h3><p className="deal-meta">{deal.properties}+ properties</p><div className="deal-stars">{'★'.repeat(deal.starRating)}{'☆'.repeat(5 - deal.starRating)}</div><div className="deal-pricing">From <span className="deal-price">₹{deal.price.toLocaleString()}</span>/night</div></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bus Deals */}
                    <div className="deals-section">
                        <div className="deals-header"><h2>🚌 Popular Bus Routes</h2><button className="view-all" onClick={() => navigate('/search?type=bus')}>View All →</button></div>
                        <div className="deals-scroll hide-scrollbar">
                            {deals.buses.map(deal => (
                                <div key={deal._id} className="deal-card card" onClick={() => navigate('/booking', { state: { deal } })}>
                                    <div className="deal-image" style={deal.image ? { backgroundImage: `url(${deal.image})`, backgroundSize: 'cover' } : { background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                                        {!deal.image && <span className="deal-emoji">🚌</span>}
                                    </div>
                                    <div className="deal-info">
                                        <div className="deal-route">{deal.from} <span>→</span> {deal.to}</div>
                                        <p className="deal-meta">{deal.duration} • {deal.classType}</p>
                                        <div className="deal-pricing">
                                            <span className="deal-price">₹{deal.price.toLocaleString()}</span>
                                            <span className="deal-original">₹{deal.originalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Train Deals */}
                    <div className="deals-section">
                        <div className="deals-header"><h2>🚆 Popular Train Routes</h2><button className="view-all" onClick={() => navigate('/search?type=train')}>View All →</button></div>
                        <div className="deals-scroll hide-scrollbar">
                            {deals.trains.map(deal => (
                                <div key={deal._id} className="deal-card card" onClick={() => navigate('/booking', { state: { deal } })}>
                                    <div className="deal-image" style={deal.image ? { backgroundImage: `url(${deal.image})`, backgroundSize: 'cover' } : { background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}>
                                        {!deal.image && <span className="deal-emoji">🚆</span>}
                                    </div>
                                    <div className="deal-info">
                                        <div className="deal-route">{deal.from} <span>→</span> {deal.to}</div>
                                        <p className="deal-meta">{deal.operator} • {deal.duration}</p>
                                        <div className="deal-pricing">
                                            <span className="deal-price">₹{deal.price.toLocaleString()}</span>
                                            <small style={{ color: '#64748b' }}>{deal.classType}</small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
