const express = require('express');
const Ticket = require('../models/Ticket');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Create ticket
router.post('/', auth, async (req, res) => {
    try {
        const ticketId = 'TKT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 4).toUpperCase();

        const ticket = new Ticket({
            ...req.body,
            ticketId,
            user: req.user._id
        });
        await ticket.save();
        res.status(201).json({ ticket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user tickets
router.get('/my', auth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ tickets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single ticket
router.get('/:id', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('user', 'name email').populate('booking');
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        res.json({ ticket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add response to ticket
router.post('/:id/respond', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        ticket.responses.push({
            message: req.body.message,
            isAdmin: false,
            respondedBy: req.user.name
        });
        await ticket.save();
        res.json({ ticket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
