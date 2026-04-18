import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchDeals } from '../api';
import BackButton from '../components/BackButton';
import './SearchResults.css';

export default function SearchResults() {
    const [results, setResults] = useState([]);
    const [groupedResults, setGroupedResults] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState('price-low');
    const [maxPrice, setMaxPrice] = useState(20000);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const type = searchParams.get('type');

    useEffect(() => {
        setLoading(true);
        const params = { sort };
        if (type) params.type = type;
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const city = searchParams.get('city');
        if (from) params.from = from;
        if (to) params.to = to;
        if (city) params.city = city;
        if (maxPrice < 20000) params.maxPrice = maxPrice;

        searchDeals(params).then(res => {
            setResults(res.data.deals);
            setGroupedResults(res.data.groupedDeals || {});
            setRecommendations(res.data.recommendations || []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [type, sort, maxPrice, searchParams]);

    const typeLabel = { flight: 'Flights', hotel: 'Hotels', bus: 'Buses', train: 'Trains' }[type];
    const typeEmoji = { flight: '✈️', hotel: '🏨', bus: '🚌', train: '🚆' }[type];

    const renderCard = (deal, isRecommended = false) => (
        <div key={deal._id} className={`result-card card ${isRecommended ? 'recommended-card' : ''}`} onClick={() => navigate('/booking', { state: { deal } })}>
            {deal.image ? (
                <div className="result-img" style={{
                    width: 200, height: 160, backgroundImage: `url(${deal.image})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0
                }}>
                    {isRecommended && <span className="recommendation-badge">Recommended</span>}
                </div>
            ) : (
                <div className="result-img-placeholder" style={{
                    width: 200, height: 160, background: '#f8fafc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0
                }}>
                    {typeEmoji}
                    {isRecommended && <span className="recommendation-badge">Recommended</span>}
                </div>
            )}
            <div className="result-left" style={{ paddingLeft: 16 }}>
                <div className="result-type-badge">{typeEmoji}</div>
                <div className="result-details">
                    <div className="flex items-center gap-2 mb-1">
                        <h3>{deal.title}</h3>
                        {deal.rating > 4.5 && <span className="fast-selling-tag">⚡ Fast Selling</span>}
                    </div>
                    <p className="result-meta">
                        {deal.from && deal.to ? `${deal.from} → ${deal.to}` : deal.city}
                        {deal.duration && ` • ${deal.duration}`}
                        {deal.operator && ` • ${deal.operator}`}
                    </p>
                    <p className="result-desc">{deal.description}</p>
                    {deal.amenities?.length > 0 && (
                        <div className="result-amenities">{deal.amenities.slice(0, 3).map((a, i) => <span key={i} className="amenity-tag">{a}</span>)}</div>
                    )}
                </div>
            </div>
            <div className="result-right">
                <div className="result-rating">★ {deal.rating}</div>
                <div className="result-price">₹{deal.price.toLocaleString()}</div>
                <div className="result-original">₹{deal.originalPrice.toLocaleString()}</div>
                <span className="badge badge-green">{deal.discount}% OFF</span>
                <button className="btn-primary result-book-btn">Book Now</button>
            </div>
        </div>
    );

    return (
        <div className="results-page">
            <div className="container results-layout">
                {/* Sidebar */}
                <aside className="filters-sidebar card-static">
                    <div className="filters-header"><h3>Filters</h3><button className="clear-btn" onClick={() => setMaxPrice(20000)}>Clear all</button></div>
                    <div className="filter-group">
                        <h4>Price Range</h4>
                        <input type="range" min="0" max="20000" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="price-range" />
                        <div className="range-labels"><span>₹0</span><span>₹{maxPrice.toLocaleString()}</span></div>
                    </div>
                    <div className="filter-group">
                        <h4>Sort By</h4>
                        <select value={sort} onChange={e => setSort(e.target.value)} className="form-input">
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Rating: Highest</option>
                        </select>
                    </div>
                </aside>

                {/* Results */}
                <div className="results-main">
                    <BackButton />
                    <div className="results-header">
                        <div>
                            <h1>{type ? `${typeEmoji} ${typeLabel} Search Results` : '🔍 Universal Search Results'}</h1>
                            <p>{results.length > 0 ? `${results.length} total options found` : 'Showing top recommendations'}</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            {[1, 2, 3].map(i => <div key={i} className="skeleton-card"></div>)}
                        </div>
                    ) : (
                        <div className="results-list">
                            {type ? (
                                // Single Type Results
                                results.length > 0 ? (
                                    results.map(deal => renderCard(deal))
                                ) : recommendations.length > 0 ? (
                                    <div className="no-results-section">
                                        <div className="empty-state card-static mb-8">
                                            <span className="empty-icon">🔍</span>
                                            <h3>No exact matches for your search</h3>
                                            <p>But here are some top-rated {typeLabel} you might like!</p>
                                        </div>
                                        <h2 className="section-subtitle mb-4">Recommended for You</h2>
                                        {recommendations.map(deal => renderCard(deal, true))}
                                    </div>
                                ) : (
                                    <div className="empty-state card-static">
                                        <span className="empty-icon">🔍</span>
                                        <h3>No results found</h3>
                                        <p>Try adjusting your filters or search criteria</p>
                                    </div>
                                )
                            ) : (
                                // Universal Results grouped by Category
                                Object.keys(groupedResults).length > 0 ? (
                                    Object.entries(groupedResults).map(([cat, deals]) => (
                                        <div key={cat} className="universal-section mb-12">
                                            <h2 className="section-type-title">
                                                {{ flight: '✈️ Flights', hotel: '🏨 Hotels', bus: '🚌 Buses', train: '🚆 Trains' }[cat]}
                                            </h2>
                                            <div className="results-list">
                                                {deals.map(deal => renderCard(deal))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state card-static">
                                        <span className="empty-icon">🔍</span>
                                        <h3>No results found for this destination</h3>
                                        <p>Try searching for a different city or check your spelling</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
