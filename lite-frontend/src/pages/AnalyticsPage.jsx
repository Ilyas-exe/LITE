import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MobileNav from '../components/MobileNav';

function AnalyticsPage() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        jobs: { total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 },
        tasks: { total: 0, todo: 0, inProgress: 0, done: 0 },
        notes: { total: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Fetch Jobs
            const jobsRes = await fetch('http://localhost:8080/api/jobs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const jobs = jobsRes.ok ? await jobsRes.json() : [];

            // Fetch Tasks
            const tasksRes = await fetch('http://localhost:8080/api/tasks', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const tasks = tasksRes.ok ? await tasksRes.json() : [];

            // Fetch Knowledge Base
            const kbRes = await fetch('http://localhost:8080/api/kb/tree', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const kbData = kbRes.ok ? await kbRes.json() : { notes: [], documents: [] };

            // Calculate stats - count both notes and documents
            const totalKBItems = (kbData.notes?.length || 0) + (kbData.documents?.length || 0);

            // Calculate stats
            setStats({
                jobs: {
                    total: jobs.length,
                    applied: jobs.filter(j => j.status === 'Applied').length,
                    interview: jobs.filter(j => j.status === 'Interview').length,
                    offer: jobs.filter(j => j.status === 'Offer').length,
                    rejected: jobs.filter(j => j.status === 'Rejected').length
                },
                tasks: {
                    total: tasks.length,
                    todo: tasks.filter(t => t.status === 'TODO').length,
                    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
                    done: tasks.filter(t => t.status === 'DONE').length
                },
                notes: {
                    total: totalKBItems
                }
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
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

    const calculatePercentage = (value, total) => {
        return total > 0 ? Math.round((value / total) * 100) : 0;
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
                        <h1 className="text-base md:text-lg font-medium text-white font-mono">ANALYTICS</h1>
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
                        Performance Overview
                    </h2>
                    <p className="text-dark-muted font-mono text-sm">
                        Track your productivity metrics
                    </p>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-dark-muted font-mono text-sm">Loading analytics...</p>
                    </div>
                )}

                {!loading && (
                    <div className="space-y-6">
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                            <div className="card">
                                <div className="text-xs uppercase tracking-wider text-dark-muted font-medium mb-4 font-mono">
                                    JOB_APPLICATIONS
                                </div>
                                <div className="text-4xl font-medium text-white font-mono mb-2">
                                    {stats.jobs.total}
                                </div>
                                <div className="text-sm text-dark-muted font-mono">
                                    Total applications tracked
                                </div>
                            </div>

                            <div className="card">
                                <div className="text-xs uppercase tracking-wider text-dark-muted font-medium mb-4 font-mono">
                                    TASKS
                                </div>
                                <div className="text-4xl font-medium text-white font-mono mb-2">
                                    {stats.tasks.total}
                                </div>
                                <div className="text-sm text-dark-muted font-mono">
                                    Total tasks created
                                </div>
                            </div>

                            <div className="card">
                                <div className="text-xs uppercase tracking-wider text-dark-muted font-medium mb-4 font-mono">
                                    KNOWLEDGE_BASE
                                </div>
                                <div className="text-4xl font-medium text-white font-mono mb-2">
                                    {stats.notes.total}
                                </div>
                                <div className="text-sm text-dark-muted font-mono">
                                    Notes & documents stored
                                </div>
                            </div>
                        </div>

                        {/* Job Application Breakdown */}
                        <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <h3 className="text-sm uppercase tracking-wider text-dark-muted font-medium mb-6 font-mono">
                                JOB_STATUS_BREAKDOWN
                            </h3>
                            <div className="space-y-4">
                                {/* Applied */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-mono text-dark-text">APPLIED</span>
                                        <span className="text-sm font-mono text-accent-blue">
                                            {stats.jobs.applied} ({calculatePercentage(stats.jobs.applied, stats.jobs.total)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-dark-card rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent-blue transition-all duration-500"
                                            style={{ width: `${calculatePercentage(stats.jobs.applied, stats.jobs.total)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Interview */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-mono text-dark-text">INTERVIEW</span>
                                        <span className="text-sm font-mono text-accent-orange">
                                            {stats.jobs.interview} ({calculatePercentage(stats.jobs.interview, stats.jobs.total)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-dark-card rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent-orange transition-all duration-500"
                                            style={{ width: `${calculatePercentage(stats.jobs.interview, stats.jobs.total)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Offer */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-mono text-dark-text">OFFER</span>
                                        <span className="text-sm font-mono text-accent-green">
                                            {stats.jobs.offer} ({calculatePercentage(stats.jobs.offer, stats.jobs.total)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-dark-card rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent-green transition-all duration-500"
                                            style={{ width: `${calculatePercentage(stats.jobs.offer, stats.jobs.total)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Rejected */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-mono text-dark-text">REJECTED</span>
                                        <span className="text-sm font-mono text-red-400">
                                            {stats.jobs.rejected} ({calculatePercentage(stats.jobs.rejected, stats.jobs.total)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-dark-card rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-400 transition-all duration-500"
                                            style={{ width: `${calculatePercentage(stats.jobs.rejected, stats.jobs.total)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Task Progress */}
                        <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <h3 className="text-sm uppercase tracking-wider text-dark-muted font-medium mb-6 font-mono">
                                TASK_PROGRESS
                            </h3>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-medium text-accent-blue font-mono mb-2">
                                        {stats.tasks.todo}
                                    </div>
                                    <div className="text-xs uppercase tracking-wider text-dark-muted font-mono">
                                        TO_DO
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-medium text-accent-orange font-mono mb-2">
                                        {stats.tasks.inProgress}
                                    </div>
                                    <div className="text-xs uppercase tracking-wider text-dark-muted font-mono">
                                        IN_PROGRESS
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-medium text-accent-green font-mono mb-2">
                                        {stats.tasks.done}
                                    </div>
                                    <div className="text-xs uppercase tracking-wider text-dark-muted font-mono">
                                        DONE
                                    </div>
                                </div>
                            </div>

                            {/* Completion Rate */}
                            <div className="mt-6 pt-6 border-t border-dark-border">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-mono text-dark-muted">COMPLETION_RATE</span>
                                    <span className="text-lg font-mono text-accent-green">
                                        {calculatePercentage(stats.tasks.done, stats.tasks.total)}%
                                    </span>
                                </div>
                                <div className="h-3 bg-dark-card rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent-green transition-all duration-500"
                                        style={{ width: `${calculatePercentage(stats.tasks.done, stats.tasks.total)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
}

export default AnalyticsPage;
