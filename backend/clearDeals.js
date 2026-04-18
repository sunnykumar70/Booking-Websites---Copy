require('dotenv').config();
const mongoose = require('mongoose');
const Deal = require('./models/Deal');

mongoose.connect(process.env.MONGODB)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        try {
            await Deal.deleteMany({}); // Delete all deals
            console.log('🗑️  All dummy deals removed.');
        } catch (error) {
            console.error('Error clearing deals:', error);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
