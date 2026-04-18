const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const Deal = require('../models/Deal');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalBookings = await Booking.countDocuments();
        const totalTickets = await Ticket.countDocuments();
        const openTickets = await Ticket.countDocuments({ status: 'open' });
        const totalDeals = await Deal.countDocuments();

        const revenueResult = await Booking.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');
        const recentTickets = await Ticket.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');

        // Bookings by type
        const bookingsByType = await Booking.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
        ]);

        // Monthly revenue (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyRevenue = await Booking.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'cancelled' } } },
            { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalUsers, totalBookings, totalTickets, openTickets, totalDeals, totalRevenue,
            recentBookings, recentTickets, bookingsByType, monthlyRevenue
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all bookings
router.get('/bookings', adminAuth, async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 }).populate('user', 'name email');
        res.json({ bookings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update booking status
router.put('/bookings/:id', adminAuth, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json({ booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all tickets
router.get('/tickets', adminAuth, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;
        const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).populate('user', 'name email');
        res.json({ tickets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update ticket status and respond
router.put('/tickets/:id', adminAuth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        if (req.body.status) ticket.status = req.body.status;
        if (req.body.message) {
            ticket.responses.push({
                message: req.body.message,
                isAdmin: true,
                respondedBy: req.user.name
            });
        }
        await ticket.save();
        res.json({ ticket });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const Destination = require('../models/Destination');

// Seed budget data
router.post('/seed-budget', adminAuth, async (req, res) => {
    try {
        await Destination.deleteMany({});
        await Deal.deleteMany({ isBudget: true });

        const destinations = [
            { name: 'Goa', startingPrice: 1100, description: 'Sun, sand and nightlife', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400' },
            { name: 'Manali', startingPrice: 899, description: 'Snowy peaks and adventure', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=400' },
            { name: 'Rishikesh', startingPrice: 450, description: 'Yoga capital and river rafting', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400' },
            { name: 'Varanasi', startingPrice: 750, description: 'Spiritual heart of India', image: 'https://images.unsplash.com/photo-1561361513-339230589d8f?auto=format&fit=crop&w=400' },
            { name: 'Udaipur', startingPrice: 650, description: 'City of lakes and palaces', image: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=400' }
        ];

        const deals = [
            { type: 'flight', to: 'Goa', from: 'Mumbai', title: 'SpiceJet SG-442', price: 1899, originalPrice: 3200, isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1524592711108-971fa3f2ec25?auto=format&fit=crop&w=400' },
            { type: 'hotel', city: 'Goa', title: 'Beachside Resort Goa', price: 1200, originalPrice: 2500, isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=400' },
            { type: 'bus', to: 'Manali', from: 'Delhi', title: 'Volvo AC Sleeper', price: 899, originalPrice: 1500, isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400' },
            { type: 'train', to: 'Varanasi', from: 'Delhi', title: 'Shiv Ganga Express', price: 750, originalPrice: 1100, isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=400' }
        ];

        await Destination.insertMany(destinations);
        await Deal.insertMany(deals);
        res.json({ message: 'Budget architecture seeded successfully!' });
    } catch (error) {
        console.error('Seed Budget Admin Route Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
