require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Deal = require('./models/Deal');
const Destination = require('./models/Destination');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Deal.deleteMany({});
        await Destination.deleteMany({});

        // Auth seed code...
        const admin = new User({ name: 'Admin', email: 'admin@makeustrip.com', phone: '9999999999', password: 'admin123', role: 'admin', rewardPoints: 10000, tier: 'Platinum' });
        await admin.save();
        const user = new User({ name: 'Sunny Roy', email: 'sunny@example.com', phone: '8888888888', password: 'user123', role: 'user', rewardPoints: 2450, tier: 'Silver' });
        await user.save();

        const deals = [
            // FLIGHTS - Budget to Mid-range
            { type: 'flight', from: 'Delhi', to: 'Mumbai', title: 'IndiGo 6E-2132', price: 2499, originalPrice: 4200, discount: 40, operator: 'IndiGo', duration: '2h 10m', stops: 'Non-stop', isFeatured: true, isActive: true, isBudget: true, image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&w=400' },
            { type: 'flight', from: 'Delhi', to: 'Manali', title: 'Alliance Air 9I-805', price: 4500, originalPrice: 6800, discount: 33, operator: 'Alliance Air', duration: '1h 20m', stops: 'Non-stop', isFeatured: true, isActive: true, isBudget: true, image: 'https://images.unsplash.com/photo-1544621424-481970340026?auto=format&fit=crop&w=400' },
            { type: 'flight', from: 'Mumbai', to: 'Goa', title: 'SpiceJet SG-442', price: 1899, originalPrice: 3200, discount: 41, operator: 'SpiceJet', duration: '1h 15m', stops: 'Non-stop', isFeatured: true, isActive: true, isBudget: true, image: 'https://images.unsplash.com/photo-1524592711108-971fa3f2ec25?auto=format&fit=crop&w=400' },
            { type: 'flight', from: 'Bangalore', to: 'Kochi', title: 'AirAsia I5-742', price: 2100, originalPrice: 3500, discount: 40, operator: 'AirAsia', duration: '1h 5m', stops: 'Non-stop', isActive: true, isBudget: true, image: 'https://images.unsplash.com/photo-1464037862834-ee578279ce91?auto=format&fit=crop&w=400' },
            { type: 'flight', from: 'Delhi', to: 'Varanasi', title: 'IndiGo 6E-6511', price: 2800, originalPrice: 4500, discount: 37, operator: 'IndiGo', duration: '1h 25m', stops: 'Non-stop', isActive: true, isBudget: true, image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&w=400' },
            { type: 'flight', from: 'Mumbai', to: 'Udaipur', title: 'Vistara UK-611', price: 3200, originalPrice: 5500, discount: 42, operator: 'Vistara', duration: '1h 15m', stops: 'Non-stop', isActive: true, isBudget: true, image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&w=400' },
            { type: 'flight', from: 'Chennai', to: 'Pondicherry', title: 'IndiGo 6E-123', price: 1999, originalPrice: 3000, discount: 33, operator: 'IndiGo', duration: '0h 50m', stops: 'Non-stop', isActive: true, isBudget: true, image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&w=400' },
            { type: 'flight', from: 'Delhi', to: 'Haridwar', title: 'Air India AI-401', price: 3500, originalPrice: 5200, discount: 32, operator: 'Air India', duration: '1h 0m', stops: 'Non-stop', isActive: true, isBudget: true, image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&w=400' },

            // HOTELS - Variety of Destinations
            { type: 'hotel', city: 'Goa', title: 'Beachside Resort Goa', price: 1200, originalPrice: 2500, discount: 52, starRating: 4, properties: 120, image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=400', isBudget: true, isActive: true },
            { type: 'hotel', city: 'Manali', title: 'Snow Peak Retreat', price: 1500, originalPrice: 3000, discount: 50, starRating: 4, properties: 45, image: 'https://images.unsplash.com/photo-1549639142-4217f300898a?auto=format&fit=crop&w=400', isBudget: true, isActive: true },
            { type: 'hotel', city: 'Rishikesh', title: 'Ganga View Guest House', price: 800, originalPrice: 1500, discount: 46, starRating: 3, properties: 15, image: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=400', isBudget: true, isActive: true },
            { type: 'hotel', city: 'Varanasi', title: 'Heritage Inn Ghats', price: 1100, originalPrice: 2200, discount: 50, starRating: 3, properties: 25, image: 'https://images.unsplash.com/photo-1561361513-339230589d8f?auto=format&fit=crop&w=400', isBudget: true, isActive: true },
            { type: 'hotel', city: 'Alleppey', title: 'Lake View Houseboat', price: 4500, originalPrice: 8000, discount: 43, starRating: 4, properties: 10, image: 'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=400', isBudget: true, isActive: true },
            { type: 'hotel', city: 'Munnar', title: 'Tea Garden Villa', price: 2200, originalPrice: 4000, discount: 45, starRating: 4, properties: 20, image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=400', isBudget: true, isActive: true },
            { type: 'hotel', city: 'Udaipur', title: 'Lake Palace View', price: 3500, originalPrice: 6000, discount: 41, starRating: 4, properties: 30, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400', isBudget: true, isActive: true },
            { type: 'hotel', city: 'Pondicherry', title: 'French Quarter Stay', price: 1800, originalPrice: 3500, discount: 48, starRating: 3, properties: 40, image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400', isBudget: true, isActive: true },

            // BUSES - Very Budget Friendly
            { type: 'bus', from: 'Delhi', to: 'Manali', title: 'Volvo AC Sleeper', price: 899, originalPrice: 1500, discount: 40, operator: 'Himalayan Express', duration: '12h', classType: 'AC Sleeper', isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400' },
            { type: 'bus', from: 'Delhi', to: 'Rishikesh', title: 'Semi-Sleeper AC', price: 450, originalPrice: 800, discount: 43, operator: 'Ganga Travels', duration: '6h', classType: 'AC Semi-Sleeper', isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400' },
            { type: 'bus', from: 'Mumbai', to: 'Goa', title: 'Direct AC Sleeper', price: 1100, originalPrice: 1800, discount: 38, operator: 'Purple Travels', duration: '14h', classType: 'AC Sleeper', isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400' },
            { type: 'bus', from: 'Bangalore', to: 'Kochi', title: 'Scania Multi-Axle', price: 950, originalPrice: 1600, discount: 40, operator: 'Kallada Travels', duration: '10h', classType: 'AC Sleeper', isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400' },
            { type: 'bus', from: 'Chennai', to: 'Pondicherry', title: 'Express AC Seater', price: 250, originalPrice: 450, discount: 44, operator: 'PRTC', duration: '3h 30m', classType: 'AC Seater', isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400' },
            { type: 'bus', from: 'Delhi', to: 'Varanasi', title: 'Luxury Sleeper', price: 1200, originalPrice: 2000, discount: 40, operator: 'Amar Travels', duration: '13h', classType: 'AC Sleeper', isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400' },

            // TRAINS - Reliable Budget Options
            { type: 'train', from: 'Delhi', to: 'Varanasi', title: 'Shiv Ganga Express', price: 750, originalPrice: 1100, discount: 31, operator: 'Indian Railways', duration: '12h', classType: '3 Tier AC', isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=400' },
            { type: 'train', from: 'Mumbai', to: 'Goa', title: 'Konkan Kanya Exp', price: 850, originalPrice: 1300, discount: 34, operator: 'Indian Railways', duration: '11h', classType: '3 Tier AC', isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=400' },
            { type: 'train', from: 'Delhi', to: 'Udaipur', title: 'Mewar Express', price: 650, originalPrice: 950, discount: 31, operator: 'Indian Railways', duration: '12h 30m', classType: '3 Tier AC', isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=400' },
            { type: 'train', from: 'Chennai', to: 'Kochi', title: 'Alleppey Express', price: 950, originalPrice: 1400, discount: 32, operator: 'Indian Railways', duration: '12h', classType: '3 Tier AC', isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=400' },
            { type: 'train', from: 'Delhi', to: 'Haridwar', title: 'Shatabdi Express', price: 550, originalPrice: 900, discount: 38, operator: 'Indian Railways', duration: '4h 30m', classType: 'CC', isBudget: true, isActive: true, image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=400' }
        ];

        const destinations = [
            { name: 'Goa', startingPrice: 1100, description: 'Sun, sand and nightlife', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400' },
            { name: 'Manali', startingPrice: 899, description: 'Snowy peaks and adventure', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=400' },
            { name: 'Rishikesh', startingPrice: 450, description: 'Yoga capital and river rafting', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400' }
        ];

        await Destination.insertMany(destinations);
        await Deal.insertMany(deals);
        console.log(`✅ ${deals.length} deals and ${destinations.length} destinations seeded`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};
seedData();
