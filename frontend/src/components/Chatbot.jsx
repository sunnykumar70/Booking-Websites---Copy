import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getChatQuestions, askChatbot } from '../api';
import './Chatbot.css';

export default function Chatbot() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [messages, setMessages] = useState([
        { text: "Hello! 👋 I'm your 24/7 travel assistant. How can I help you today?", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const messagesEnd = useRef(null);

    useEffect(() => {
        getChatQuestions().then(res => setQuestions(res.data.questions)).catch(() => { });
    }, []);

    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleAsk = async (question) => {
        setMessages(prev => [...prev, { text: question, isBot: false }]);
        try {
            const res = await askChatbot(question);
            setMessages(prev => [...prev, { text: res.data.answer, isBot: true }]);
        } catch {
            setMessages(prev => [...prev, { text: 'Sorry, something went wrong. Please try again.', isBot: true }]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        handleAsk(input.trim());
        setInput('');
    };

    return (
        <div className="chatbot-container">
            <button className="chatbot-trigger" onClick={() => setOpen(!open)}>
                {open ? (
                    <svg width="28" height="28" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg width="28" height="28" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                )}
                {!open && <span className="chatbot-badge">1</span>}
            </button>

            {open && (
                <div className="chatbot-window animate-fade-in">
                    <div className="chatbot-header">
                        <div className="chatbot-avatar">🤖</div>
                        <div>
                            <h3>Travel Assistant</h3>
                            <p>Online • Replies instantly</p>
                        </div>
                        <button onClick={() => setOpen(false)} className="chatbot-close">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chatbot-msg ${msg.isBot ? 'bot' : 'user'}`}>
                                {msg.isBot && <div className="msg-avatar">🤖</div>}
                                <div className={`msg-bubble ${msg.isBot ? 'bot-bubble' : 'user-bubble'}`}>
                                    {msg.text.split('\n').map((line, j) => <p key={j}>{line}</p>)}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEnd} />
                    </div>

                    <div className="chatbot-questions hide-scrollbar">
                        {questions.map((q, i) => (
                            <button key={i} className="chatbot-question-btn" onClick={() => handleAsk(q)}>{q}</button>
                        ))}
                    </div>

                    <form className="chatbot-input-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="chatbot-input"
                        />
                        <button type="submit" className="chatbot-send">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
