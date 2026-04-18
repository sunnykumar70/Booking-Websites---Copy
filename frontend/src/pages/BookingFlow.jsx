import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../api';
import BackButton from '../components/BackButton';
import './BookingFlow.css';

const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function BookingFlow() {
    const { state } = useLocation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const deal = state?.deal;
    const [step, setStep] = useState(1);
    const [traveler, setTraveler] = useState({ firstName: '', lastName: '', email: user?.email || '', phone: user?.phone || '', gender: '', age: '', specialRequests: '' });
    const [addons, setAddons] = useState([]);
    const [payment, setPayment] = useState('upi');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    if (!deal) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h2>No deal selected</h2><button className="btn-primary" onClick={() => navigate('/')}>Go Home</button></div>;

    const addonList = [
        { name: 'Travel Insurance', price: 199, icon: '🛡️', desc: 'Comprehensive coverage' },
        { name: 'Meal Preference', price: 350, icon: '🍽️', desc: 'Pre-book your meals' },
        { name: 'Seat Selection', price: 299, icon: '💺', desc: 'Choose preferred seat' },
        { name: 'Extra Baggage', price: 1200, icon: '🧳', desc: 'Add extra 15kg' }
    ];

    const toggleAddon = (addon) => {
        setAddons(prev => prev.find(a => a.name === addon.name) ? prev.filter(a => a.name !== addon.name) : [...prev, addon]);
    };

    const taxes = Math.round(deal.price * 0.12);
    const addonsTotal = addons.reduce((s, a) => s + a.price, 0);
    const discount = deal.originalPrice - deal.price;
    const total = deal.price + taxes + addonsTotal;

    const getTravelerErrors = (data = traveler) => {
        let newErrors = {};
        if (!data.firstName || !/^[A-Za-z]+$/.test(data.firstName) || data.firstName.length < 2) 
            newErrors.firstName = "Min 2 letters required";
        if (!data.lastName || !/^[A-Za-z]+$/.test(data.lastName)) 
            newErrors.lastName = "Letters only";
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) 
            newErrors.email = "Valid email required";
        if (!data.phone || !/^\d{10}$/.test(data.phone)) 
            newErrors.phone = "Exactly 10 digits required";
        if (!data.gender) 
            newErrors.gender = "Required field";
        if (!data.age || data.age < 1 || data.age > 120) 
            newErrors.age = "Must be 1-120";
        if (data.specialRequests && data.specialRequests.length > 300) 
            newErrors.specialRequests = "Max 300 characters";
        return newErrors;
    };

    const handleFieldChange = (field, value) => {
        const newTraveler = { ...traveler, [field]: value };
        setTraveler(newTraveler);
        // Clear error dynamically if user fixes it while typing
        if (errors[field]) {
            const currentErrors = getTravelerErrors(newTraveler);
            if (!currentErrors[field]) {
                setErrors(prev => ({ ...prev, [field]: undefined }));
            }
        }
    };

    const handleBlur = (field) => {
        const currentErrors = getTravelerErrors(traveler);
        if (currentErrors[field]) {
            setErrors(prev => ({ ...prev, [field]: currentErrors[field] }));
        }
    };

    const handleContinueToStep3 = () => {
        const newErrors = getTravelerErrors(traveler);
        if (Object.keys(newErrors).length === 0) {
            setStep(3);
        } else {
            setErrors(newErrors);
            const firstErrorKey = Object.keys(newErrors)[0];
            setTimeout(() => {
                const el = document.getElementById(firstErrorKey);
                if (el) {
                    el.focus();
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 0);
        }
    };

    const handleBook = async () => {
        if (!user) return navigate('/login');
        setLoading(true);

        const resSDK = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!resSDK) {
            alert('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
        }

        try {
            // Get Razorpay Key from backend (so frontend doesn't need to hardcode it)
            const keyResponse = await fetch('http://localhost:5001/api/payment/key');
            const { key } = await keyResponse.json();

            // Create Order
            const orderResponse = await fetch('http://localhost:5001/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: total })
            });
            const orderData = await orderResponse.json();
            if (!orderData || orderData.error) throw new Error(orderData.error || "Failed to create order");

            var options = {
                key: key,
                amount: orderData.amount,
                currency: "INR",
                name: "MakeUsTrip",
                description: `Booking for ${deal.title}`,
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        const verifyResponse = await fetch('http://localhost:5001/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            })
                        });
                        const verifyResult = await verifyResponse.json();
                        
                        if (verifyResult.error) {
                            alert("Payment verification failed! " + verifyResult.error);
                            return;
                        }

                        // Payment successful, proceed to create booking
                        const bookingRes = await createBooking({
                            deal: deal._id, type: deal.type, from: deal.from, to: deal.to, city: deal.city,
                            travelerDetails: traveler, addons, baseFare: deal.price, taxes, addonsTotal, discount, totalAmount: total, paymentMethod: 'razorpay', paymentId: response.razorpay_payment_id
                        });
                        navigate('/confirmation', { state: { booking: bookingRes.data.booking, points: bookingRes.data.pointsEarned } });
                        
                    } catch (err) {
                        alert(err.response?.data?.error || "Error finishing booking confirmation");
                    }
                },
                prefill: {
                    name: `${traveler.firstName} ${traveler.lastName}`,
                    email: traveler.email,
                    contact: traveler.phone
                },
                theme: {
                    color: "#f97316"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            alert(err.message || 'Payment initiation failed.');
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="booking-page">
            <div className="container booking-layout">
                <div className="booking-main">
                    {/* Stepper */}
                    <div className="stepper card-static">
                        {['Review', 'Traveler', 'Add-ons', 'Payment'].map((s, i) => (
                            <div key={i} className={`step ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                                <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Review */}
                    {step === 1 && (
                        <div className="step-content card-static animate-fade-in">
                            <h2>Review Your Selection</h2>
                            <div className="review-card">
                                <div className="review-emoji">{deal.type === 'flight' ? '✈️' : deal.type === 'hotel' ? '🏨' : deal.type === 'bus' ? '🚌' : '🚆'}</div>
                                <div className="review-info">
                                    <h3>{deal.title}</h3>
                                    <p>{deal.from && deal.to ? `${deal.from} → ${deal.to}` : deal.city}</p>
                                    <p>{deal.duration && `Duration: ${deal.duration}`} {deal.operator && `• ${deal.operator}`}</p>
                                    <p>{deal.description}</p>
                                </div>
                            </div>
                            <div className="step-actions"><BackButton /><button className="btn-primary" onClick={() => setStep(2)}>Continue →</button></div>
                        </div>
                    )}

                    {/* Step 2: Traveler */}
                    {step === 2 && (
                        <div className="step-content card-static animate-fade-in">
                            <h2>Traveler Details</h2>
                            <div className="form-grid">
                                <div className="auth-field">
                                    <label>First Name *</label>
                                    <input id="firstName" className="form-input" style={{ borderColor: errors.firstName ? 'red' : '' }} value={traveler.firstName} onChange={e => handleFieldChange('firstName', e.target.value)} onBlur={() => handleBlur('firstName')} placeholder="First name" />
                                    {errors.firstName && <span style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors.firstName}</span>}
                                </div>
                                <div className="auth-field">
                                    <label>Last Name *</label>
                                    <input id="lastName" className="form-input" style={{ borderColor: errors.lastName ? 'red' : '' }} value={traveler.lastName} onChange={e => handleFieldChange('lastName', e.target.value)} onBlur={() => handleBlur('lastName')} placeholder="Last name" />
                                    {errors.lastName && <span style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors.lastName}</span>}
                                </div>
                                <div className="auth-field">
                                    <label>Email *</label>
                                    <input id="email" type="email" className="form-input" style={{ borderColor: errors.email ? 'red' : '' }} value={traveler.email} onChange={e => handleFieldChange('email', e.target.value)} onBlur={() => handleBlur('email')} />
                                    {errors.email && <span style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors.email}</span>}
                                </div>
                                <div className="auth-field">
                                    <label>Phone *</label>
                                    <input id="phone" type="tel" className="form-input" style={{ borderColor: errors.phone ? 'red' : '' }} value={traveler.phone} onChange={e => handleFieldChange('phone', e.target.value)} onBlur={() => handleBlur('phone')} />
                                    {errors.phone && <span style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors.phone}</span>}
                                </div>
                                <div className="auth-field">
                                    <label>Gender</label>
                                    <select id="gender" className="form-input" style={{ borderColor: errors.gender ? 'red' : '' }} value={traveler.gender} onChange={e => handleFieldChange('gender', e.target.value)} onBlur={() => handleBlur('gender')}>
                                        <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                                    </select>
                                    {errors.gender && <span style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors.gender}</span>}
                                </div>
                                <div className="auth-field">
                                    <label>Age</label>
                                    <input id="age" type="number" className="form-input" style={{ borderColor: errors.age ? 'red' : '' }} value={traveler.age} onChange={e => handleFieldChange('age', e.target.value)} onBlur={() => handleBlur('age')} />
                                    {errors.age && <span style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors.age}</span>}
                                </div>
                            </div>
                            <div className="auth-field">
                                <label>Special Requests</label>
                                <textarea id="specialRequests" className="form-input" style={{ borderColor: errors.specialRequests ? 'red' : '' }} rows="3" value={traveler.specialRequests} onChange={e => handleFieldChange('specialRequests', e.target.value)} onBlur={() => handleBlur('specialRequests')} placeholder="Any special requirements..." />
                                {errors.specialRequests && <span style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{errors.specialRequests}</span>}
                            </div>
                            <div className="step-actions"><button className="btn-secondary" onClick={() => setStep(1)}>← Back</button><button className="btn-primary" onClick={handleContinueToStep3}>Continue →</button></div>
                        </div>
                    )}

                    {/* Step 3: Addons */}
                    {step === 3 && (
                        <div className="step-content card-static animate-fade-in">
                            <h2>Add-ons & Extras</h2>
                            <div className="addons-list">
                                {addonList.map(addon => (
                                    <div key={addon.name} className={`addon-card ${addons.find(a => a.name === addon.name) ? 'selected' : ''}`} onClick={() => toggleAddon(addon)}>
                                        <div className="addon-left"><span className="addon-icon">{addon.icon}</span><div><strong>{addon.name}</strong><small>{addon.desc}</small></div></div>
                                        <div className="addon-price">₹{addon.price}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="step-actions"><button className="btn-secondary" onClick={() => setStep(2)}>← Back</button><button className="btn-primary" onClick={() => setStep(4)}>Continue →</button></div>
                        </div>
                    )}

                    {/* Step 4: Payment */}
                    {step === 4 && (
                        <div className="step-content card-static animate-fade-in">
                            <h2>Payment Method</h2>
                            <div className="payment-options">
                                {[{ val: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm', icon: '📱' }, { val: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Rupay', icon: '💳' }, { val: 'netbanking', label: 'Net Banking', desc: 'All major banks', icon: '🏦' }, { val: 'wallet', label: 'Wallets', desc: 'Amazon Pay, Mobikwik', icon: '👛' }].map(pm => (
                                    <label key={pm.val} className={`payment-option ${payment === pm.val ? 'selected' : ''}`}>
                                        <input type="radio" name="payment" value={pm.val} checked={payment === pm.val} onChange={e => setPayment(e.target.value)} />
                                        <span className="payment-icon">{pm.icon}</span>
                                        <div><strong>{pm.label}</strong><small>{pm.desc}</small></div>
                                    </label>
                                ))}
                            </div>
                            <div className="step-actions"><button className="btn-secondary" onClick={() => setStep(3)}>← Back</button><button className="btn-primary" onClick={handleBook} disabled={loading}>{loading ? 'Processing...' : '🔒 Pay Now'}</button></div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="booking-sidebar card-static">
                    <h3>Order Summary</h3>
                    <div className="summary-item"><span>{deal.title}</span></div>
                    <hr />
                    <div className="summary-row"><span>Base Fare</span><span>₹{deal.price.toLocaleString()}</span></div>
                    <div className="summary-row"><span>Taxes & Fees</span><span>₹{taxes.toLocaleString()}</span></div>
                    {addonsTotal > 0 && <div className="summary-row"><span>Add-ons</span><span>₹{addonsTotal.toLocaleString()}</span></div>}
                    <div className="summary-row green"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>
                    <hr />
                    <div className="summary-total"><span>Total Amount</span><span className="total-price">₹{total.toLocaleString()}</span></div>
                    <div className="summary-savings">🎉 You're saving ₹{discount.toLocaleString()} on this booking!</div>
                </div>
            </div>
        </div>
    );
}
