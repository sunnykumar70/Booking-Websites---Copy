import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5001/api' });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('makeustrip_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Deals
export const getDeals = (params) => API.get('/deals', { params });
export const searchDeals = (params) => API.get('/deals/search', { params });
export const getDeal = (id) => API.get(`/deals/${id}`);
export const getDestinations = (params) => API.get('/destinations', { params });

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);

// Tickets
export const createTicket = (data) => API.post('/tickets', data);
export const getMyTickets = () => API.get('/tickets/my');
export const respondToTicket = (id, data) => API.post(`/tickets/${id}/respond`, data);

// Chatbot
export const getChatQuestions = () => API.get('/chatbot/questions');
export const askChatbot = (question) => API.post('/chatbot/ask', { question });

export default API;
