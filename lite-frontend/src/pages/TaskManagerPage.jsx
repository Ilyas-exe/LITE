import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
                        <div className="kanban-board">
                            <div className="kanban-column">
                                <div className="column-header todo-header">
                                    <h3>📋 To Do</h3>
                                    <span className="task-count">{todoTasks.length}</span>
                                </div>
                                <div className="column-content">
                                    {todoTasks.length === 0 ? (
                                        <p className="empty-column">No tasks</p>
                                    ) : (
                                        todoTasks.map(task => (
                                            <div key={task.id} className="task-card">
                                                <h4>{task.title}</h4>
                                                {task.description && (
                                                    <p className="task-description">{task.description}</p>
                                                )}
                                                {task.dueDate && (
                                                    <p className="task-due-date">
                                                        📅 {new Date(task.dueDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="kanban-column">
                                <div className="column-header in-progress-header">
                                    <h3>⚡ In Progress</h3>
                                    <span className="task-count">{inProgressTasks.length}</span>
                                </div>
                                <div className="column-content">
                                    {inProgressTasks.length === 0 ? (
                                        <p className="empty-column">No tasks</p>
                                    ) : (
                                        inProgressTasks.map(task => (
                                            <div key={task.id} className="task-card">
                                                <h4>{task.title}</h4>
                                                {task.description && (
                                                    <p className="task-description">{task.description}</p>
                                                )}
                                                {task.dueDate && (
                                                    <p className="task-due-date">
                                                        📅 {new Date(task.dueDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="kanban-column">
                                <div className="column-header done-header">
                                    <h3>✅ Done</h3>
                                    <span className="task-count">{doneTasks.length}</span>
                                </div>
                                <div className="column-content">
                                    {doneTasks.length === 0 ? (
                                        <p className="empty-column">No tasks</p>
                                    ) : (
                                        doneTasks.map(task => (
                                            <div key={task.id} className="task-card">
                                                <h4>{task.title}</h4>
                                                {task.description && (
                                                    <p className="task-description">{task.description}</p>
                                                )}
                                                {task.dueDate && (
                                                    <p className="task-due-date">
                                                        📅 {new Date(task.dueDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default TaskManagerPage;
