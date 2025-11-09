import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from '../components/GlobalSearch';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);
    const [stats, setStats] = useState({ jobs: 0, tasks: 0, kb: 0 });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setSearchOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');

            const [jobsRes, tasksRes, kbRes] = await Promise.all([
                fetch('http://localhost:8080/api/jobs', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:8080/api/tasks', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:8080/api/kb/tree', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const jobs = jobsRes.ok ? await jobsRes.json() : [];
            const tasks = tasksRes.ok ? await tasksRes.json() : [];
            const kbData = kbRes.ok ? await kbRes.json() : { notes: [], documents: [] };

            setStats({
                jobs: jobs.length,
                tasks: tasks.filter(t => t.status !== 'DONE').length,
                kb: (kbData.notes?.length || 0) + (kbData.documents?.length || 0)
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const modules = [
        {
            title: 'JOB_TRACKER',
            description: 'Track applications and career progress',
            path: '/job-tracker',
            stats: `${stats.jobs} ${stats.jobs === 1 ? 'Application' : 'Applications'}`
        },
        {
            title: 'TASK_MANAGER',
            description: 'Organize tasks with Kanban board',
            path: '/task-manager',
            stats: `${stats.tasks} Pending`
        },
        {
            title: 'KNOWLEDGE_BASE',
            description: 'Store notes and documentation',
            path: '/knowledge-base',
            stats: `${stats.kb} Items`
        },
        {
            title: 'ANALYTICS',
            description: 'View productivity metrics and stats',
            path: '/analytics',
            stats: 'Dashboard'
        }
    ];

    return (
        <div className="min-h-screen animate-fade-in">
            {/* Header */}
            <header className="border-b border-dark-border bg-dark-bg/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent-blue rounded flex items-center justify-center">
                            <span className="text-white font-mono text-sm font-bold">L</span>
                        </div>
                        <h1 className="text-lg font-medium text-white font-mono">LITE</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center gap-2 text-sm text-dark-muted hover:text-white font-mono transition-colors border border-dark-border hover:border-accent-blue px-4 py-1.5 rounded"
                        >
                            SEARCH
                            <span className="text-xs">⌘K</span>
                        </button>
                        <div className="text-sm text-dark-muted font-mono">
                            <span className="text-dark-text">{user?.username || 'User'}</span>
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
                {/* Welcome Section */}
                <div className="mb-12 animate-slide-up">
                    <h2 className="text-3xl font-medium text-white mb-2 font-mono">
                        Welcome Back
                    </h2>
                    <p className="text-dark-muted font-mono text-sm">
                        Your personal productivity workspace
                    </p>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {modules.map((module, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(module.path)}
                            className="card cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-base font-medium text-white font-mono">
                                    {module.title}
                                </h3>
                                <span className="text-dark-muted group-hover:text-accent-blue transition-colors font-mono text-sm">
                                    →
                                </span>
                            </div>

                            <p className="text-sm text-dark-muted mb-4 font-mono">
                                {module.description}
                            </p>

                            <div className="text-xs text-dark-muted font-mono border-t border-dark-border pt-3">
                                {module.stats}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Account Info */}
                <div className="card max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-sm uppercase tracking-wider text-dark-muted font-medium mb-4 font-mono">
                        Account Details
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-dark-border">
                            <span className="text-sm text-dark-muted font-mono">NAME</span>
                            <span className="text-sm text-white font-mono">{user?.username}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-dark-muted font-mono">EMAIL</span>
                            <span className="text-sm text-white font-mono">{user?.email}</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Global Search Modal */}
            <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
};

export default Dashboard;
