import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * ProtectedRoute component
 * Wraps routes that require authentication
 * Redirects to /login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <h2>Loading...</h2>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the children (protected content)
    return children;
};

export default ProtectedRoute;
