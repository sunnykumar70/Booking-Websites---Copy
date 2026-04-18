const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const Joi = require('joi');
const router = express.Router();

const validateBooking = (req, res, next) => {
    const schema = Joi.object({
        deal: Joi.string().required(),
        type: Joi.string().required(),
        from: Joi.string().allow('', null),
        to: Joi.string().allow('', null),
        city: Joi.string().allow('', null),
        travelerDetails: Joi.object({
            firstName: Joi.string().pattern(/^[A-Za-z]+$/).min(2).required().trim().messages({
                'string.pattern.base': 'First name must contain only letters',
                'string.min': 'First name needs to be at least 2 characters long'
            }),
            lastName: Joi.string().pattern(/^[A-Za-z]+$/).required().trim().messages({
                'string.pattern.base': 'Last name must contain only letters'
            }),
            email: Joi.string().email().required().trim(),
            phone: Joi.string().pattern(/^\d{10}$/).required().trim().messages({
                'string.pattern.base': 'Phone number must be exactly 10 digits'
            }),
            gender: Joi.string().valid('Male', 'Female', 'Other').required(),
            age: Joi.number().integer().min(1).max(120).required(),
            specialRequests: Joi.string().max(300).allow('', null).trim()
        }).required(),
        addons: Joi.array(),
        baseFare: Joi.number().required(),
        taxes: Joi.number().required(),
        addonsTotal: Joi.number().required(),
        discount: Joi.number().required(),
        totalAmount: Joi.number().required(),
        paymentMethod: Joi.string().required(),
        paymentId: Joi.string().required()
    }).unknown(true); // Allow other fields if necessary

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = {};
        error.details.forEach(detail => {
            errors[detail.context.key] = detail.message;
        });
        return res.status(400).json({ success: false, message: "Validation error", errors });
    }
    next();
};

// Create booking
router.post('/', auth, validateBooking, async (req, res) => {
    try {
        const bookingRef = 'MUT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

        const booking = new Booking({
            ...req.body,
            user: req.user._id,
            bookingRef
        });
        await booking.save();

        // Add reward points
        const points = Math.floor(booking.totalAmount / 100);
        await User.findByIdAndUpdate(req.user._id, { $inc: { rewardPoints: points } });

        res.status(201).json({ booking, pointsEarned: points });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user bookings
router.get('/my', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('deal');
        res.json({ bookings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single booking
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('deal');
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json({ booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { status: 'cancelled' },
            { new: true }
        );
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json({ booking, message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
