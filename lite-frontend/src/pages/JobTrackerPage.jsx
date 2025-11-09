import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import JobTable from '../components/JobTable';
import AddJobForm from '../components/AddJobForm';
import { exportJobsToCSV, exportJobsToPDF } from '../utils/exportUtils';

function JobTrackerPage() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

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
                        {/* Stats & Controls */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="font-mono text-sm text-dark-muted">
                                TOTAL: <span className="text-white font-medium">{jobs.length}</span> {jobs.length === 1 ? 'APPLICATION' : 'APPLICATIONS'}
                            </div>
                            <div className="flex items-center gap-3">
                                {/* View Toggle */}
                                <div className="flex items-center gap-1 border border-dark-border rounded overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`text-xs px-3 py-1.5 font-mono transition-colors ${viewMode === 'table'
                                            ? 'bg-accent-blue text-black'
                                            : 'text-dark-muted hover:text-white'
                                            }`}
                                    >
                                        TABLE
                                    </button>
                                    <button
                                        onClick={() => setViewMode('cards')}
                                        className={`text-xs px-3 py-1.5 font-mono transition-colors ${viewMode === 'cards'
                                            ? 'bg-accent-blue text-black'
                                            : 'text-dark-muted hover:text-white'
                                            }`}
                                    >
                                        CARDS
                                    </button>
                                </div>

                                {/* Export Buttons */}
                                <button
                                    onClick={() => exportJobsToCSV(jobs)}
                                    disabled={jobs.length === 0}
                                    className="text-xs px-3 py-1.5 rounded border border-dark-border text-dark-muted hover:text-accent-blue hover:border-accent-blue transition-colors font-mono disabled:opacity-30"
                                >
                                    EXPORT_CSV
                                </button>
                                <button
                                    onClick={() => exportJobsToPDF(jobs)}
                                    disabled={jobs.length === 0}
                                    className="text-xs px-3 py-1.5 rounded border border-dark-border text-dark-muted hover:text-accent-blue hover:border-accent-blue transition-colors font-mono disabled:opacity-30"
                                >
                                    EXPORT_PDF
                                </button>
                            </div>
                        </div>

                        {/* Job Display */}
                        <JobTable jobs={jobs} onRefresh={fetchJobs} viewMode={viewMode} />
                    </div>
                )}

                {/* Floating Add Button */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-accent-blue hover:bg-accent-blue/80 text-black rounded-full flex items-center justify-center text-2xl shadow-lg shadow-accent-blue/20 transition-all hover:scale-110 z-50 font-mono"
                    title="Add Job Application"
                >
                    +
                </button>

                {/* Add Job Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowAddModal(false)}>
                        <div className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-2xl w-full mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                            <AddJobForm onJobAdded={() => { fetchJobs(); setShowAddModal(false); }} onCancel={() => setShowAddModal(false)} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default JobTrackerPage;
