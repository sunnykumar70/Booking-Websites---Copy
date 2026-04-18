import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDestinations, searchDeals } from '../api';
import './BudgetPlanner.css';

export default function BudgetPlanner() {
    const [budget, setBudget] = useState('');
    const [allDeals, setAllDeals] = useState([]);
    const [destinations, setDestinations] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePlanTrip = async (e) => {
        e.preventDefault();
        if (!budget || isNaN(budget)) return;

        setLoading(true);
        try {
            const res = await getDestinations({ maxPrice: budget });
            setDestinations(res.data.destinations || []);
            setSelectedDestination(null);
            setAllDeals([]); // Reset deals until destination is picked
        } catch (error) {
            console.error('Error fetching budget destinations:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectDestination = async (dest) => {
        setLoading(true);
        try {
            // Fetch both city-based (hotels) and to-based (flights/trains/buses) deals
            const [resCity, resTo] = await Promise.all([
                searchDeals({ city: dest.name, isBudget: true }),
                searchDeals({ to: dest.name, isBudget: true })
            ]);

            // Combine results and remove duplicates by ID
            const combinedDeals = [...(resCity.data.deals || []), ...(resTo.data.deals || [])];
            const uniqueDeals = Array.from(new Map(combinedDeals.map(d => [d._id, d])).values());

            setAllDeals(uniqueDeals);
            setSelectedDestination(dest.name);
        } catch (error) {
            console.error('Error fetching deals for destination:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEmoji = (type) => {
        switch (type) {
            case 'flight': return '✈️';
            case 'hotel': return '🏨';
            case 'bus': return '🚌';
            case 'train': return '🚆';
            default: return '📍';
        }
    };

    const getFilteredResults = () => {
        if (!selectedDestination) return {};
        const destDeals = allDeals.filter(d => (d.city || d.to) === selectedDestination);
        const groupedDeals = {};
        destDeals.forEach(deal => {
            if (!groupedDeals[deal.type]) {
                groupedDeals[deal.type] = [];
            }
            groupedDeals[deal.type].push(deal);
        });

        // Optional: Sort each category by price ascending
        Object.keys(groupedDeals).forEach(type => {
            groupedDeals[type].sort((a, b) => a.price - b.price);
        });

        return groupedDeals;
    };

    const results = getFilteredResults();

    return (
        <div className="budget-planner-card animate-fade-in shadow-lg">
            <div className="budget-planner-header">
                <h2>💰 Budget Trip Planner</h2>
                <p>Tell us your budget, and we'll show you the best destinations!</p>
            </div>

            <form onSubmit={handlePlanTrip} className="budget-input-group">
                <div className="budget-input-wrapper">
                    <span className="budget-currency">₹</span>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="Enter your budget (e.g. 10000)"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Searching...' : 'Find Destinations 🚀'}
                </button>
            </form>

            {destinations && !selectedDestination && (
                <div className="destinations-section animate-slide-up">
                    <h3 className="mb-4 text-lg font-bold">Destinations within your budget:</h3>
                    {destinations.length > 0 ? (
                        <div className="destinations-grid">
                            {destinations.map(dest => (
                                <div
                                    key={dest._id}
                                    className="destination-card"
                                    onClick={() => selectDestination(dest)}
                                    style={{ backgroundImage: `url(${dest.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400'})` }}
                                >
                                    <div className="overlay"></div>
                                    <h3>{dest.name}</h3>
                                    <p>Starts from ₹{dest.startingPrice?.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <span>😕</span>
                            <h3>No destinations found within this budget</h3>
                            <p>Try increasing your budget for more options.</p>
                        </div>
                    )}
                </div>
            )}

            {selectedDestination && (
                <div className="selected-destination-results animate-slide-up">
                    <div className="back-nav" onClick={() => setSelectedDestination(null)}>
                        ← Back to Destinations
                    </div>
                    <h3 className="mb-4 text-xl font-bold">Best options for {selectedDestination}:</h3>
                    <div className="budget-results">
                        {Object.entries(results).map(([type, deals]) => (
                            <div key={type} className="budget-result-category">
                                <div className="category-label">All {type.charAt(0).toUpperCase() + type.slice(1)}s</div>
                                <div className="deals-scroll-container hide-scrollbar">
                                    {deals.map(deal => (
                                        <div
                                            key={deal._id}
                                            className="deal-card card best-pick-card"
                                            onClick={() => navigate('/booking', { state: { deal } })}
                                        >
                                            <div className="deal-image" style={deal.image ? { backgroundImage: `url(${deal.image})`, backgroundSize: 'cover' } : { background: 'linear-gradient(135deg, #1e3a5f, #0d1b2a)' }}>
                                                {!deal.image && <span className="deal-emoji">{getEmoji(type)}</span>}
                                                <span className="badge badge-green" style={{ position: 'absolute', top: 12, right: 12 }}>₹{deal.price.toLocaleString()}</span>
                                            </div>
                                            <div className="deal-info">
                                                {type === 'hotel' ? (
                                                    <>
                                                        <h3>{deal.city}</h3>
                                                        <div className="deal-stars">{'★'.repeat(deal.starRating || 0)}{'☆'.repeat(5 - (deal.starRating || 0))}</div>
                                                    </>
                                                ) : (
                                                    <div className="deal-route">{deal.from} <span>→</span> {deal.to}</div>
                                                )}
                                                <div className="deal-pricing">
                                                    <span className="deal-price">View Deal →</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
