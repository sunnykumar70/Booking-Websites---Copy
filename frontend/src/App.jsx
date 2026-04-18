import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SearchResults from './pages/SearchResults';
import BookingFlow from './pages/BookingFlow';
import Confirmation from './pages/Confirmation';
import MyBookings from './pages/MyBookings';
import CreateTicket from './pages/CreateTicket';
import Community from './pages/Community';
import GroupTrip from './pages/GroupTrip';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Header />
                <main className="page-wrapper">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/search" element={<SearchResults />} />
                        <Route path="/booking" element={<BookingFlow />} />
                        <Route path="/confirmation" element={<Confirmation />} />
                        <Route path="/my-bookings" element={<MyBookings />} />
                        <Route path="/create-ticket" element={<CreateTicket />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/group-trip" element={<GroupTrip />} />
                    </Routes>
                </main>
                <Footer />
                <Chatbot />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
