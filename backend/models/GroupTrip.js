const mongoose = require('mongoose');

const groupTripSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    destination: { type: String, required: true, trim: true },
    groupSize: { type: String, required: true },
    tripType: { type: String, default: 'Other', enum: ['Corporate', 'Wedding', 'Student Group', 'Family Reunion', 'Friends Trip', 'Other'] },
    travelDate: { type: String, default: '' },
    budget: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { type: String, default: 'pending', enum: ['pending', 'contacted', 'confirmed', 'closed'] },
}, { timestamps: true });

module.exports = mongoose.model('GroupTrip', groupTripSchema);
