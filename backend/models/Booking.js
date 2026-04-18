const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
    bookingRef: { type: String, required: true, unique: true },
    type: { type: String, enum: ['flight', 'hotel', 'bus', 'train'], required: true },
    from: String,
    to: String,
    city: String,
    travelDate: Date,
    returnDate: Date,
    passengers: { type: Number, default: 1 },
    travelerDetails: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        gender: String,
        age: Number,
        specialRequests: String
    },
    addons: [{
        name: String,
        price: Number
    }],
    baseFare: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    addonsTotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'upi' },
    status: { type: String, enum: ['confirmed', 'pending', 'cancelled', 'completed'], default: 'confirmed' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
