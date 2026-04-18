import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import './Community.css';

export default function Community() {
    const { user } = useAuth();
    const [stories, setStories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        location: '',
        rating: 5,
        media: []
    });

    // Mock data for demo
    useEffect(() => {
        const demoStories = [
            {
                _id: '1',
                title: '🏖️ Paradise Found in Maldives',
                content: 'The crystal clear waters and white sandy beaches were breathtaking. A must-visit for everyone!',
                location: 'Maldives',
                rating: 5,
                media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800' }],
                user: { name: 'Sarah Miller', avatar: 'S' },
                likes: 124,
                createdAt: new Date().toISOString()
            },
            {
                _id: '2',
                title: '🗻 Breathtaking Views from Swiss Alps',
                content: 'Waking up to these snow-capped mountains was a dream come true. The air is so fresh here!',
                location: 'Switzerland',
                rating: 5,
                media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800' }],
                user: { name: 'David Chen', avatar: 'D' },
                likes: 89,
                createdAt: new Date().toISOString()
            },
            {
                _id: '3',
                title: '🍜 Street Food Adventure in Tokyo',
                content: 'From Ramen to Takoyaki, every corner of Tokyo has something delicious to offer. My taste buds are happy!',
                location: 'Tokyo, Japan',
                rating: 4,
                media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1503899036084-755c48bb4168?auto=format&fit=crop&w=800' }],
                user: { name: 'Elena Rodriguez', avatar: 'E' },
                likes: 215,
                createdAt: new Date().toISOString()
            }
        ];
        setStories(demoStories);
    }, []);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // In a real app, we would upload to a server
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('video/') ? 'video' : 'image';
            setFormData({ ...formData, media: [...formData.media, { type, url }] });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newStory = {
            ...formData,
            _id: Date.now().toString(),
            user: { name: user?.name || 'Anonymous', avatar: (user?.name || 'A').charAt(0) },
            likes: 0,
            createdAt: new Date().toISOString()
        };
        setStories([newStory, ...stories]);
        setShowModal(false);
        setFormData({ title: '', content: '', location: '', rating: 5, media: [] });
    };

    return (
        <div className="community-page">
            <header className="community-header">
                <div className="container">
                    <BackButton className="dark-back-btn" />
                    <h1 className="community-title">Travel Stories & Reviews</h1>
                    <p className="community-subtitle">Inspired by thousands of journeys from our global community</p>
                    <button className="share-btn" onClick={() => setShowModal(true)}>
                        <span className="btn-icon">📸</span> Share Your Journey
                    </button>
                </div>
            </header>

            <main className="container">
                <div className="stories-grid">
                    {stories.map(story => (
                        <div key={story._id} className="story-card card-hover">
                            <div className="story-media-wrapper">
                                {story.media[0]?.type === 'video' ? (
                                    <video src={story.media[0].url} controls className="story-media" />
                                ) : (
                                    <div className="story-media" style={{ backgroundImage: `url(${story.media[0]?.url})` }} />
                                )}
                                <div className="story-badge">{story.location}</div>
                            </div>
                            <div className="story-content">
                                <div className="story-user">
                                    <div className="user-avatar" style={{ backgroundColor: ['#f97316', '#3b82f6', '#9333ea', '#22c55e'][story.user.name.length % 4] }}>
                                        {story.user.avatar}
                                    </div>
                                    <div className="user-info">
                                        <div className="user-name">{story.user.name}</div>
                                        <div className="story-date">{new Date(story.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="story-rating">
                                        {'★'.repeat(story.rating)}{'☆'.repeat(5 - story.rating)}
                                    </div>
                                </div>
                                <h3 className="story-title">{story.title}</h3>
                                <p className="story-text">{story.content}</p>
                                <div className="story-footer">
                                    <div className="story-likes">
                                        <span className="like-icon">❤️</span> {story.likes} Likes
                                    </div>
                                    <button className="read-more">Read More →</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Share Your Experience</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="story-form">
                            <div className="form-group">
                                <label>Title of Your Story</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Magical Sunset in Bali"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Where did you go?"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Rating</label>
                                    <select
                                        value={formData.rating}
                                        onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                    >
                                        <option value="5">5 - Excellent</option>
                                        <option value="4">4 - Very Good</option>
                                        <option value="3">3 - Good</option>
                                        <option value="2">2 - Fair</option>
                                        <option value="1">1 - Poor</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Tell Your Story</label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Share your experience..."
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>Upload Media (Photo/Video)</label>
                                <div className="media-upload-box">
                                    <input type="file" id="media-upload" accept="image/*,video/*" onChange={handleFileUpload} hidden />
                                    <label htmlFor="media-upload" className="upload-placeholder">
                                        <span className="upload-icon">📁</span>
                                        {formData.media.length > 0 ? `${formData.media.length} file(s) selected` : 'Click to upload photo or video'}
                                    </label>
                                </div>
                                {formData.media.length > 0 && (
                                    <div className="media-preview-grid">
                                        {formData.media.map((item, index) => (
                                            <div key={index} className="media-preview-item">
                                                {item.type === 'video' ? <video src={item.url} /> : <img src={item.url} />}
                                                <button type="button" className="remove-media" onClick={() => {
                                                    const newMedia = [...formData.media];
                                                    newMedia.splice(index, 1);
                                                    setFormData({ ...formData, media: newMedia });
                                                }}>&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="submit-btn">Share Story 🚀</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
