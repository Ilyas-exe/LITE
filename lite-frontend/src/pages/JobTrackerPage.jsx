import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import JobTable from '../components/JobTable';
import AddJobForm from '../components/AddJobForm';
import MobileNav from '../components/MobileNav';
import { exportJobsToCSV, exportJobsToPDF } from '../utils/exportUtils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

function JobTrackerPage() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onNew: () => setShowAddModal(true),
        onExport: () => exportJobsToCSV(filteredJobs),
        onFocusSearch: () => searchInputRef.current?.focus(),
        onEscape: () => setShowAddModal(false)
    });

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
            setFilteredJobs(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredJobs(jobs);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = jobs.filter(job =>
            job.company?.toLowerCase().includes(lowerQuery) ||
            job.wayOfApplying?.toLowerCase().includes(lowerQuery) ||
            job.contact?.toLowerCase().includes(lowerQuery) ||
            job.status?.toLowerCase().includes(lowerQuery) ||
            job.jobDescription?.toLowerCase().includes(lowerQuery)
        );
        setFilteredJobs(filtered);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen animate-fade-in pb-20 md:pb-0">
            {/* Header */}
            <header className="border-b border-dark-border bg-dark-bg/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={handleBackToDashboard}
                            className="text-dark-muted hover:text-white font-mono text-xs md:text-sm transition-colors"
                        >
                            ← BACK
                        </button>
                        <div className="h-4 w-px bg-dark-border"></div>
                        <h1 className="text-base md:text-lg font-medium text-white font-mono">JOB_TRACKER</h1>
                    </div>

                    <div className="flex items-center gap-2 md:gap-6">
                        <div className="text-xs md:text-sm text-dark-muted font-mono hidden sm:block">
                            <span className="text-dark-text">{user?.username}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-xs md:text-sm text-dark-muted hover:text-white font-mono transition-colors border border-dark-border hover:border-accent-blue px-2 md:px-4 py-1.5 rounded"
                        >
                            LOGOUT
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
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
                        {/* Search Bar */}
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <span className="text-dark-muted font-mono text-xs font-bold">SEARCH</span>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search applications..."
                                    className="flex-1 bg-transparent border-none text-white font-mono text-sm focus:outline-none placeholder:text-dark-muted"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="text-dark-muted hover:text-white font-mono text-sm transition-colors"
                                    >
                                        CLEAR
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats & Controls */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="font-mono text-sm text-dark-muted">
                                SHOWING: <span className="text-white font-medium">{filteredJobs.length}</span> / {jobs.length} {jobs.length === 1 ? 'APPLICATION' : 'APPLICATIONS'}
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Add Button */}
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="text-xs px-3 py-1.5 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/20 hover:border-accent-blue transition-colors font-mono"
                                >
                                    + ADD
                                </button>

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
                        <JobTable jobs={filteredJobs} onRefresh={fetchJobs} />
                    </div>
                )}

                {/* Add Job Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowAddModal(false)}>
                        <div className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-2xl w-full mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                            <AddJobForm onJobAdded={() => { fetchJobs(); setShowAddModal(false); }} onCancel={() => setShowAddModal(false)} />
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
}

export default JobTrackerPage;
