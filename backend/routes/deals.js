const express = require('express');
const Deal = require('../models/Deal');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all deals (with optional type filter)
router.get('/', async (req, res) => {
    try {
        const { type, featured, limit, isBudget } = req.query;
        const filter = { isActive: true };
        if (type) filter.type = type;
        if (featured === 'true') filter.isFeatured = true;
        if (isBudget === 'true') filter.isBudget = true;

        const deals = await Deal.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit) || 50);
        res.json({ deals });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search deals
router.get('/search', async (req, res) => {
    try {
        const { type, from, to, city, minPrice, maxPrice, sort, isBudget } = req.query;
        const filter = { isActive: true };
        if (type) filter.type = type;
        if (isBudget === 'true') filter.isBudget = true;
        if (from) filter.from = new RegExp(from, 'i');
        if (to) filter.to = new RegExp(to, 'i');
        if (city) filter.city = new RegExp(city, 'i');
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseInt(minPrice);
            if (maxPrice) filter.price.$lte = parseInt(maxPrice);
        }

        let sortObj = { price: 1 };
        if (sort === 'price-high') sortObj = { price: -1 };
        if (sort === 'rating') sortObj = { rating: -1 };
        if (sort === 'duration') sortObj = { duration: 1 };

        let deals = await Deal.find(filter).sort(sortObj);

        // Group deals by type if it's a universal search (no specific type provided)
        let groupedDeals = {};
        if (!type) {
            deals.forEach(deal => {
                if (!groupedDeals[deal.type]) groupedDeals[deal.type] = [];
                groupedDeals[deal.type].push(deal);
            });
        }

        let recommendations = [];
        // If no deals found, get recommendations
        if (deals.length === 0) {
            const recFilter = { isActive: true };
            if (type) recFilter.type = type;
            recommendations = await Deal.find(recFilter)
                .sort({ rating: -1 })
                .limit(5);
        }

        res.json({ deals, groupedDeals, recommendations, total: deals.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single deal
router.get('/:id', async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.id);
        if (!deal) return res.status(404).json({ error: 'Deal not found' });
        res.json({ deal });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create deal (admin)
router.post('/', adminAuth, async (req, res) => {
    try {
        console.log('Creating deal with body:', req.body);
        const deal = new Deal(req.body);
        await deal.save();
        res.status(201).json({ deal });
    } catch (error) {
        console.error('Deal Creation Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update deal (admin)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!deal) return res.status(404).json({ error: 'Deal not found' });
        res.json({ deal });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete deal (admin)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        await Deal.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deal deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
