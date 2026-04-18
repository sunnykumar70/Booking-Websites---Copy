const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) return res.status(401).json({ error: 'Invalid token.' });

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Access denied.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        console.log('AdminAuth check - User:', user ? user.email : 'Not found', 'Role:', user ? user.role : 'N/A');

        if (!user || user.role !== 'admin') {
            console.log('AdminAuth failed for user:', user ? user.email : 'Unknown');
            return res.status(403).json({ error: 'Admin access required.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('AdminAuth error:', error.message);
        res.status(401).json({ error: 'Invalid token.' });
    }
};

module.exports = { auth, adminAuth };
