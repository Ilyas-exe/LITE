import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import JobTable from '../components/JobTable';
import './JobTrackerPage.css';

function JobTrackerPage() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:8080/api/jobs', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await response.json();
            setJobs(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="job-tracker-page">
            <header className="job-tracker-header">
                <div className="header-content">
                    <h1>📋 Job Tracker</h1>
                    <div className="header-actions">
                        <button onClick={handleBackToDashboard} className="back-btn">
                            ← Back to Dashboard
                        </button>
                        <span className="user-email">{user?.email}</span>
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="job-tracker-main">
                <div className="container">
                    <div className="page-intro">
                        <h2>Track Your Job Applications</h2>
                        <p>Manage all your job applications in one place</p>
                    </div>

                    {loading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading your job applications...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <p>⚠️ {error}</p>
                            <button onClick={fetchJobs} className="retry-btn">
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="job-tracker-content">
                            <div className="jobs-count">
                                <p>You have <strong>{jobs.length}</strong> job application{jobs.length !== 1 ? 's' : ''}</p>
                            </div>

                            <JobTable jobs={jobs} onRefresh={fetchJobs} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default JobTrackerPage;
