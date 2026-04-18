import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('makeustrip_token');
        if (token) {
            getMe().then(res => setUser(res.data.user)).catch(() => {
                localStorage.removeItem('makeustrip_token');
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const loginUser = useCallback((token, userData) => {
        localStorage.setItem('makeustrip_token', token);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('makeustrip_token');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loginUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
