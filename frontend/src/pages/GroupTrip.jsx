import BackButton from '../components/BackButton';
import TripSplitter from '../components/TripSplitter';
import './GroupTrip.css';

export default function GroupTrip() {
    return (
        <div className="group-trip-page fade-in">
            <div className="container" style={{ padding: '20px 0', marginTop: '20px' }}>
                <BackButton />
            </div>
            {/* Splitter Section (Sole content of the page now) */}
            <TripSplitter />
        </div>
    );
}
