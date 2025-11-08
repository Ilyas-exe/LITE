import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>LITE Dashboard</h1>
                    <div className="user-info">
                        <span>Welcome, {user?.username || 'User'}!</span>
                        <button onClick={handleLogout} className="btn-logout">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="welcome-section">
                    <h2>🎉 Welcome to LITE!</h2>
                    <p>Your personal career and productivity dashboard</p>

                    <div className="features-grid">
                        <div className="feature-card" onClick={() => navigate('/job-tracker')} style={{ cursor: 'pointer' }}>
                            <h3>📋 Job Tracker</h3>
                            <p>Track your job applications and manage your career search</p>
                            <button className="feature-btn">Open →</button>
                        </div>

                        <div className="feature-card" onClick={() => navigate('/task-manager')} style={{ cursor: 'pointer' }}>
                            <h3>📝 Task Manager</h3>
                            <p>Organize your tasks with a Trello-like board</p>
                            <button className="feature-btn">Open →</button>
                        </div>

                        <div className="feature-card">
                            <h3>📚 Knowledge Base</h3>
                            <p>Store and organize your notes and documents</p>
                            <span className="coming-soon">Coming Soon</span>
                        </div>
                    </div>
                </div>

                <div className="user-details">
                    <h3>Your Account</h3>
                    <div className="detail-item">
                        <strong>Email:</strong> {user?.email}
                    </div>
                    <div className="detail-item">
                        <strong>Name:</strong> {user?.username}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
