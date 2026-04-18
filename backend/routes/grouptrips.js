const express = require('express');
const router = express.Router();
const GroupTrip = require('../models/GroupTrip');

// @route   POST /api/grouptrips/inquire
// @desc    Submit a group trip inquiry
router.post('/inquire', async (req, res) => {
    const { name, email, phone, destination, groupSize, tripType, travelDate, budget, message } = req.body;

    if (!name || !email || !destination || !groupSize) {
        return res.status(400).json({ message: 'Please provide all required fields (name, email, destination, group size).' });
    }

    try {
        const inquiry = await GroupTrip.create({
            name, email, phone, destination,
            groupSize, tripType: tripType || 'Other',
            travelDate, budget, message
        });

        console.log('✅ New Group Trip Inquiry saved:', inquiry._id);

        res.status(201).json({
            message: 'Your inquiry has been submitted successfully! Our group travel expert will contact you within 24 hours.',
            inquiry
        });
    } catch (err) {
        console.error('❌ GroupTrip save error:', err.message);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// @route   GET /api/grouptrips/inquiries
// @desc    Get all inquiries (Admin)
router.get('/inquiries', async (req, res) => {
    try {
        const inquiries = await GroupTrip.find().sort({ createdAt: -1 });
        res.json({ count: inquiries.length, inquiries });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;

