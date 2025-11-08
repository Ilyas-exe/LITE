import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import AddTaskModal from '../components/AddTaskModal';
import './TaskManagerPage.css';

function TaskManagerPage() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

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
        } catch (err) {
            setError(err.message);
            console.error('Error fetching tasks:', err);
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

    // Group tasks by status
    const todoTasks = tasks.filter(task => task.status === 'TODO');
    const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS');
    const doneTasks = tasks.filter(task => task.status === 'DONE');

    return (
        <div className="task-manager-page">
            <header className="task-manager-header">
                <div className="header-content">
                    <h1>📝 Task Manager</h1>
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

            <main className="task-manager-main">
                <div className="container">
                    <div className="page-intro">
                        <h2>Organize Your Tasks</h2>
                        <p>Manage your tasks with a Trello-style board</p>
                        <button onClick={() => setShowAddModal(true)} className="add-task-btn">
                            + Add New Task
                        </button>
                    </div>

                    {loading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading your tasks...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <p>⚠️ {error}</p>
                            <button onClick={fetchTasks} className="retry-btn">
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
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
                        </>
                    )}
                </div >
            </main >
        </div >
    );
}

export default TaskManagerPage;
