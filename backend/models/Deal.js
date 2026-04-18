const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    type: { type: String, enum: ['flight', 'hotel', 'bus', 'train'], required: true },
    from: { type: String, default: '' },
    to: { type: String, default: '' },
    city: { type: String, default: '' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    duration: { type: String, default: '' },
    image: { type: String, default: '' },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    amenities: [String],
    stops: { type: String, default: 'Non-stop' },
    classType: { type: String, default: '' },
    operator: { type: String, default: '' },
    departureTime: { type: String, default: '' },
    arrivalTime: { type: String, default: '' },
    properties: { type: Number, default: 0 },
    starRating: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isBudget: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deal', dealSchema);
