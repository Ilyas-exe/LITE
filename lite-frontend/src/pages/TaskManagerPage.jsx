import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import AddTaskModal from '../components/AddTaskModal';
import MobileNav from '../components/MobileNav';
import { exportTasksToCSV, exportTasksToPDF } from '../utils/exportUtils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

function TaskManagerPage() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onNew: () => setShowAddModal(true),
        onExport: () => exportTasksToCSV(filteredTasks),
        onFocusSearch: () => searchInputRef.current?.focus(),
        onEscape: () => setShowAddModal(false)
    });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:8080/api/tasks', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const data = await response.json();
            setTasks(data);
            setFilteredTasks(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredTasks(tasks);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = tasks.filter(task =>
            task.title?.toLowerCase().includes(lowerQuery) ||
            task.description?.toLowerCase().includes(lowerQuery) ||
            task.status?.toLowerCase().includes(lowerQuery)
        );
        setFilteredTasks(filtered);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const todoTasks = filteredTasks.filter(task => task.status === 'TODO');
    const inProgressTasks = filteredTasks.filter(task => task.status === 'IN_PROGRESS');
    const doneTasks = filteredTasks.filter(task => task.status === 'DONE');

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
                        <h1 className="text-base md:text-lg font-medium text-white font-mono">TASK_MANAGER</h1>
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4 animate-slide-up">
                    <div>
                        <h2 className="text-xl md:text-2xl font-medium text-white mb-1 md:mb-2 font-mono">
                            Organize Tasks
                        </h2>
                        <p className="text-dark-muted font-mono text-xs md:text-sm">
                            Kanban-style task management
                        </p>
                    </div>
                    <div className="flex gap-2 md:gap-3">
                        <button
                            onClick={() => exportTasksToCSV(tasks)}
                            disabled={tasks.length === 0}
                            className="text-xs px-3 py-1.5 rounded border border-dark-border text-dark-muted hover:text-accent-blue hover:border-accent-blue transition-colors font-mono disabled:opacity-30"
                        >
                            EXPORT_CSV
                        </button>
                        <button
                            onClick={() => exportTasksToPDF(tasks)}
                            disabled={tasks.length === 0}
                            className="text-xs px-3 py-1.5 rounded border border-dark-border text-dark-muted hover:text-accent-blue hover:border-accent-blue transition-colors font-mono disabled:opacity-30"
                        >
                            EXPORT_PDF
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary"
                        >
                            ADD_TASK
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 animate-slide-up">
                        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-dark-muted font-mono text-sm">Loading tasks...</p>
                    </div>
                )}

                {error && (
                    <div className="card bg-red-500/5 border-red-500/20 animate-slide-up">
                        <p className="text-red-400 font-mono text-sm mb-4">{error}</p>
                        <button onClick={fetchTasks} className="btn-primary">
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
                                    placeholder="Search by title, description, or status..."
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

                        {/* Stats */}
                        <div className="font-mono text-sm text-dark-muted">
                            SHOWING: <span className="text-white font-medium">{filteredTasks.length}</span> / {tasks.length} {tasks.length === 1 ? 'TASK' : 'TASKS'}
                        </div>

                        <KanbanBoard
                            tasks={tasks}
                            onTaskUpdate={fetchTasks}
                            onTaskDelete={fetchTasks}
                        />

                        <AddTaskModal
                            isOpen={showAddModal}
                            onClose={() => setShowAddModal(false)}
                            onTaskAdded={fetchTasks}
                        />
                    </div>
                )}
            </main>

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
}

export default TaskManagerPage;
