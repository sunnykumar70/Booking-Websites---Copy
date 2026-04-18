const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const user = new User({ name, email, phone, password });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, rewardPoints: user.rewardPoints, tier: user.tier }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, rewardPoints: user.rewardPoints, tier: user.tier }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    res.json({ user: req.user });
});

// Update profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true }).select('-password');
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login?error=AuthFailed' }), (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const user = { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, avatar: req.user.avatar };
    res.redirect(`http://localhost:3000/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
});

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: 'http://localhost:3000/login?error=AuthFailed' }), (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const user = { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, avatar: req.user.avatar };
    res.redirect(`http://localhost:3000/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
});

module.exports = router;

