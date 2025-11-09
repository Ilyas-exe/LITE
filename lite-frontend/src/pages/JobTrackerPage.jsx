import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import JobTable from '../components/JobTable';
import AddJobForm from '../components/AddJobForm';

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
        <div className="min-h-screen animate-fade-in">
            {/* Header */}
            <header className="border-b border-dark-border bg-dark-bg/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBackToDashboard}
                            className="text-dark-muted hover:text-white font-mono text-sm transition-colors"
                        >
                            ← BACK
                        </button>
                        <div className="h-4 w-px bg-dark-border"></div>
                        <h1 className="text-lg font-medium text-white font-mono">JOB_TRACKER</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-sm text-dark-muted font-mono">
                            <span className="text-dark-text">{user?.username}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-dark-muted hover:text-white font-mono transition-colors border border-dark-border hover:border-accent-blue px-4 py-1.5 rounded"
                        >
                            LOGOUT
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="mb-8 animate-slide-up">
                    <h2 className="text-2xl font-medium text-white mb-2 font-mono">
                        Track Applications
                    </h2>
                    <p className="text-dark-muted font-mono text-sm">
                        Manage your job application pipeline
                    </p>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 animate-slide-up">
                        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-dark-muted font-mono text-sm">Loading applications...</p>
                    </div>
                )}

                {error && (
                    <div className="card bg-red-500/5 border-red-500/20 animate-slide-up">
                        <p className="text-red-400 font-mono text-sm mb-4">{error}</p>
                        <button onClick={fetchJobs} className="btn-primary">
                            RETRY
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {/* Stats */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="font-mono text-sm text-dark-muted">
                                TOTAL: <span className="text-white font-medium">{jobs.length}</span> {jobs.length === 1 ? 'APPLICATION' : 'APPLICATIONS'}
                            </div>
                        </div>

                        {/* Add Job Form */}
                        <AddJobForm onJobAdded={fetchJobs} />

                        {/* Job Table */}
                        <JobTable jobs={jobs} onRefresh={fetchJobs} />
                    </div>
                )}
            </main>
        </div>
    );
}

export default JobTrackerPage;
