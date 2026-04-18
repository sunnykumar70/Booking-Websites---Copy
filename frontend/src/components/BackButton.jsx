import { useNavigate } from 'react-router-dom';
import './BackButton.css';

const BackButton = ({ label = 'Back', className = '' }) => {
    const navigate = useNavigate();

    return (
        <button
            className={`back-btn-container ${className}`}
            onClick={() => navigate(-1)}
            aria-label="Go back to previous page"
        >
            <span className="back-icon">←</span>
            <span className="back-label">{label}</span>
        </button>
    );
};

export default BackButton;
