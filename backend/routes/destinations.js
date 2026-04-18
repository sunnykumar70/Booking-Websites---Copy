const express = require('express');
const Destination = require('../models/Destination');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all destinations (public)
router.get('/', async (req, res) => {
    try {
        const { maxPrice } = req.query;
        const filter = { isActive: true };
        if (maxPrice) filter.startingPrice = { $lte: parseInt(maxPrice) };

        const destinations = await Destination.find(filter).sort({ startingPrice: 1 });
        res.json({ destinations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin routes
router.post('/', adminAuth, async (req, res) => {
    try {
        const destination = new Destination(req.body);
        await destination.save();
        res.status(201).json({ destination });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', adminAuth, async (req, res) => {
    try {
        const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ destination });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', adminAuth, async (req, res) => {
    try {
        await Destination.findByIdAndDelete(req.params.id);
        res.json({ message: 'Destination deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
