const express = require('express');
const router = express.Router();

// Predefined Q&A for chatbot
const chatbotQA = {
    'How do I book a flight?': 'To book a flight on MakeUsTrip:\n1. Go to the home page and click on the "Flights" tab\n2. Enter your departure city, destination, travel dates, and number of passengers\n3. Click "Search" to view available flights\n4. Select your preferred flight and click "Book Now"\n5. Fill in traveler details and choose add-ons\n6. Select payment method and complete your booking\nYou\'ll receive a confirmation with your booking reference!',

    'What is the cancellation policy?': 'Our cancellation policy:\n• **Free cancellation** within 24 hours of booking\n• **Flights**: Cancellation charges of ₹500-₹2000 depending on the airline and fare type\n• **Hotels**: Free cancellation up to 48 hours before check-in (for most hotels)\n• **Buses**: Cancellation charges vary by operator, typically 10-25% of fare\n• **Trains**: As per IRCTC cancellation policy\nRefunds are processed within 5-7 business days.',

    'How can I get a refund?': 'To get a refund:\n1. Go to "My Bookings" in your profile\n2. Select the booking you want to cancel\n3. Click "Cancel Booking"\n4. The refund will be initiated automatically\n• **UPI/Wallet**: Refund within 24-48 hours\n• **Credit/Debit Card**: Refund within 5-7 business days\n• **Net Banking**: Refund within 3-5 business days\nYou can also raise a support ticket for refund-related queries.',

    'What payment methods are accepted?': 'We accept multiple payment methods:\n• **UPI**: Google Pay, PhonePe, Paytm, BHIM UPI\n• **Cards**: Visa, Mastercard, Rupay (Credit & Debit)\n• **Net Banking**: All major Indian banks supported\n• **Wallets**: Amazon Pay, Mobikwik, Freecharge\n• **EMI**: Available on select cards for bookings above ₹3,000\nAll payments are 100% secure with 256-bit SSL encryption.',

    'How do I earn reward points?': 'Earn TripRewards points on every booking!\n• **Flights**: 2X points per ₹100 spent\n• **Hotels**: 3X points per ₹100 spent\n• **Buses & Trains**: 1X points per ₹100 spent\n• **Referrals**: 500 bonus points for each friend who signs up\n\n**Tier Benefits:**\n🥉 Bronze (0-999 pts): Basic rewards\n🥈 Silver (1,000-2,499 pts): 5% extra discount\n🥇 Gold (2,500-4,999 pts): 10% extra + priority support\n💎 Platinum (5,000+ pts): 15% extra + free upgrades',

    'How do I contact customer support?': 'You can reach our 24/7 customer support through:\n• **Chat**: Use this chatbot for instant help\n• **Support Ticket**: Raise a ticket from your dashboard for detailed queries\n• **Email**: support@makeustrip.com\n• **Phone**: 1800-123-4567 (Toll-free)\n• **WhatsApp**: +91 98765-43210\nOur average response time is under 2 minutes!',

    'How do I create a support ticket?': 'To create a support ticket:\n1. Log in to your account\n2. Navigate to your profile or bookings section\n3. Click "Raise a Ticket" or "Need Help?"\n4. Select the category (Booking, Payment, Cancellation, Refund, Technical, Other)\n5. Set priority level and describe your issue\n6. Submit the ticket\nYou\'ll receive a unique Ticket ID (TKT-XXXXX) for tracking. Our team will respond within 2-4 hours.',

    'Are there any offers available?': 'Yes! We have exciting offers:\n🔥 **Flash Sale**: Up to 40% off on domestic flights every Tuesday\n🏨 **Hotel Weekends**: Extra 25% off on weekend hotel bookings\n🚌 **Bus Pass**: Book 3 bus trips, get 4th free\n🚆 **Train Tatkal**: Special discounts on Tatkal bookings\n💎 **First Booking**: Flat ₹500 off on your first booking with code WELCOME500\n📱 **App Exclusive**: Extra 10% off when booking through our app',

    'How do I check my booking status?': 'To check your booking status:\n1. Log in to your MakeUsTrip account\n2. Go to "My Bookings" from the profile menu\n3. You\'ll see all your bookings with their current status:\n   • ✅ **Confirmed**: Booking is confirmed\n   • ⏳ **Pending**: Payment processing\n   • ❌ **Cancelled**: Booking has been cancelled\n   • ✔️ **Completed**: Trip completed\nYou can also track using your Booking Reference (MUT-XXXXX).',

    'Is my payment secure?': 'Absolutely! Your payment security is our top priority:\n🔒 **256-bit SSL Encryption** on all transactions\n🛡️ **PCI DSS Compliant** payment gateway\n✅ **3D Secure** authentication for card payments\n🔐 **Tokenized** card storage - we never store your full card details\n💰 **100% Refund Guarantee** for failed transactions\nWe are certified by VeriSign and comply with RBI guidelines for online payments.'
};

// Get all predefined questions
router.get('/questions', (req, res) => {
    const questions = Object.keys(chatbotQA);
    res.json({ questions });
});

// Get answer for a question
router.post('/ask', (req, res) => {
    const { question } = req.body;

    // Direct match
    if (chatbotQA[question]) {
        return res.json({ answer: chatbotQA[question] });
    }

    // Fuzzy match
    const lowerQuestion = question.toLowerCase();
    for (const [q, a] of Object.entries(chatbotQA)) {
        if (lowerQuestion.includes(q.toLowerCase().split(' ').slice(2).join(' '))) {
            return res.json({ answer: a });
        }
    }

    // Default response
    res.json({
        answer: 'Thank you for your question! For detailed assistance, please raise a support ticket from your dashboard. Our team will respond within 2-4 hours. You can also call us at 1800-123-4567 (toll-free) for immediate help.'
    });
});

module.exports = router;
