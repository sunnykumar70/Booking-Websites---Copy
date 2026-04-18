const mongoose = require('mongoose');
const Deal = require('./models/Deal');
require('dotenv').config();

mongoose.connect(process.env.MONGODB)
    .then(async () => {
        const count = await Deal.countDocuments();
        console.log(`Deals count: ${count}`);
        if (count === 0) {
            console.log('Database is empty. Creating a test deal...');
            await Deal.create({
                title: 'Test Deal - Goa',
                type: 'flight',
                from: 'Mumbai',
                to: 'Goa',
                price: 5000,
                originalPrice: 8000,
                description: 'A test deal to verify frontend visibility.',
                image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z29hfGVufDB8fDB8fHww',
                isFeatured: true
            });
            console.log('Test deal created.');
        }
        mongoose.disconnect();
    })
    .catch(err => console.error(err));
