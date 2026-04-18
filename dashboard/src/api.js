import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5001/api' });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const adminLogin = (data) => API.post('/auth/login', data);
export const getStats = () => API.get('/admin/stats');
export const getUsers = () => API.get('/admin/users');
export const getBookings = () => API.get('/admin/bookings');
export const getTickets = () => API.get('/admin/tickets');
export const updateTicketStatus = (id, data) => API.put(`/admin/tickets/${id}`, data);
export const respondToTicket = (id, data) => API.post(`/admin/tickets/${id}/respond`, data);

export const createDeal = (data) => API.post('/deals', data);
export const updateDeal = (id, data) => API.put(`/deals/${id}`, data);
export const deleteDeal = (id) => API.delete(`/deals/${id}`);
export const seedBudgetData = () => API.post('/admin/seed-budget');
export const uploadImage = (formData) => API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export default API;
