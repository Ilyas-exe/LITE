import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiService from '../services/apiService';

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component that wraps the app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                // Check if token is expired
                const decoded = jwtDecode(storedToken);
                const currentTime = Date.now() / 1000;

                if (decoded.exp > currentTime) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } else {
                    // Token expired, clear storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        setLoading(false);
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const response = await apiService.post('/auth/login', {
                email,
                password,
            });

            const { jwtToken, username } = response.data;

            // Store token and user info
            localStorage.setItem('token', jwtToken);
            localStorage.setItem('user', JSON.stringify({ email, username }));

            setToken(jwtToken);
            setUser({ email, username });

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed. Please check your credentials.',
            };
        }
    };

    // Register function
    const register = async (name, email, password) => {
        try {
            const response = await apiService.post('/auth/register', {
                name,
                email,
                password,
            });

            const { jwtToken, username } = response.data;

            // Store token and user info
            localStorage.setItem('token', jwtToken);
            localStorage.setItem('user', JSON.stringify({ email, username }));

            setToken(jwtToken);
            setUser({ email, username });

            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed. Email might already be in use.',
            };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
