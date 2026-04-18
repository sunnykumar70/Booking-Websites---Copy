import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-grid">
                <div>
                    <div className="footer-brand">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#f97316"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        <span>MakeUs<span style={{ color: '#f97316' }}>Trip</span></span>
                    </div>
                    <p className="footer-desc">Your one-stop platform for booking flights, hotels, buses & trains at the best prices. Trusted by millions of travelers across India.</p>
                </div>
                <div>
                    <h4>Company</h4>
                    <ul><li><a href="#">About Us</a></li><li><a href="#">Careers</a></li><li><a href="#">Press</a></li><li><a href="#">Blog</a></li></ul>
                </div>
                <div>
                    <h4>Support</h4>
                    <ul><li><a href="#">Help Center</a></li><li><a href="#">FAQs</a></li><li><Link to="/create-ticket">Contact Us</Link></li><li><a href="#">Cancellation Policy</a></li></ul>
                </div>
                <div>
                    <h4>Legal</h4>
                    <ul><li><a href="#">Terms of Service</a></li><li><a href="#">Privacy Policy</a></li><li><a href="#">Cookie Policy</a></li><li><a href="#">Refund Policy</a></li></ul>
                </div>
            </div>
            <div className="container footer-bottom">
                <p>© 2024 MakeUsTrip. All rights reserved. Made with ❤️ in India</p>
            </div>
        </footer>
    );
}
