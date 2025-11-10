import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { exportFullBackup } from '../utils/exportUtils';

const UserSettingsPage = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        username: '',
        email: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            showMessage('success', 'Profile updated successfully!');
        } catch (error) {
            showMessage('error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showMessage('error', 'New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showMessage('error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/users/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to change password');
            }

            showMessage('success', 'Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            showMessage('error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            await exportFullBackup();
            showMessage('success', 'Data exported successfully!');
        } catch (error) {
            showMessage('error', 'Failed to export data');
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            '⚠️ WARNING: This will permanently delete your account and ALL your data (jobs, tasks, notes). This action CANNOT be undone. Are you absolutely sure?'
        );

        if (!confirmed) return;

        const doubleConfirm = window.confirm(
            'Last chance! Type your username to confirm deletion: ' + user?.username
        );

        if (!doubleConfirm) return;

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/users/account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            showMessage('success', 'Account deleted successfully');
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (error) {
            showMessage('error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg">
            {/* Header */}
            <header className="border-b border-dark-border bg-dark-bg/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-dark-muted hover:text-white font-mono text-xs md:text-sm transition-colors"
                            >
                                ← BACK
                            </button>
                            <h1 className="text-base md:text-lg font-medium text-white font-mono">USER_SETTINGS</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-xs md:text-sm text-dark-muted font-mono">
                                <span className="text-dark-text">{user?.username}</span>
                            </div>
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                                className="text-xs md:text-sm text-dark-muted hover:text-white font-mono transition-colors border border-dark-border hover:border-accent-blue px-2 md:px-4 py-1.5 rounded"
                            >
                                LOGOUT
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12">
                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded border font-mono text-sm ${message.type === 'success'
                        ? 'bg-accent-green/10 border-accent-green text-accent-green'
                        : 'bg-red-500/10 border-red-500 text-red-500'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Profile Settings */}
                    <div className="card animate-slide-up">
                        <h2 className="text-sm uppercase tracking-wider text-dark-muted font-medium mb-6 font-mono">
                            PROFILE_INFORMATION
                        </h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-xs text-dark-muted font-mono mb-2">USERNAME</label>
                                <input
                                    type="text"
                                    value={profileData.username}
                                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-dark-muted font-mono mb-2">EMAIL</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full disabled:opacity-50"
                            >
                                {loading ? 'UPDATING...' : 'UPDATE_PROFILE'}
                            </button>
                        </form>
                    </div>

                    {/* Theme Settings */}
                    <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-sm uppercase tracking-wider text-dark-muted font-medium mb-6 font-mono">
                            APPEARANCE
                        </h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-mono text-sm mb-1">Theme Mode</p>
                                <p className="text-dark-muted font-mono text-xs">
                                    Current: {theme === 'dark' ? 'DARK_MODE' : 'LIGHT_MODE'}
                                </p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="px-4 py-2 rounded border border-dark-border text-dark-muted hover:text-white hover:border-accent-blue transition-colors font-mono text-sm"
                            >
                                TOGGLE_THEME
                            </button>
                        </div>
                    </div>

                    {/* Password Change */}
                    <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-sm uppercase tracking-wider text-dark-muted font-medium mb-6 font-mono">
                            CHANGE_PASSWORD
                        </h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-xs text-dark-muted font-mono mb-2">CURRENT_PASSWORD</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-dark-muted font-mono mb-2">NEW_PASSWORD</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="input-field"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-dark-muted font-mono mb-2">CONFIRM_NEW_PASSWORD</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="input-field"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full disabled:opacity-50"
                            >
                                {loading ? 'CHANGING...' : 'CHANGE_PASSWORD'}
                            </button>
                        </form>
                    </div>

                    {/* Data Management */}
                    <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <h2 className="text-sm uppercase tracking-wider text-dark-muted font-medium mb-6 font-mono">
                            DATA_MANAGEMENT
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-dark-border">
                                <div>
                                    <p className="text-white font-mono text-sm mb-1">Export All Data</p>
                                    <p className="text-dark-muted font-mono text-xs">
                                        Download backup of all jobs, tasks, and notes
                                    </p>
                                </div>
                                <button
                                    onClick={handleExportData}
                                    className="px-4 py-2 rounded border border-dark-border text-dark-muted hover:text-accent-green hover:border-accent-green transition-colors font-mono text-sm"
                                >
                                    EXPORT
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="card border-red-500/30 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <h2 className="text-sm uppercase tracking-wider text-red-500 font-medium mb-6 font-mono">
                            DANGER_ZONE
                        </h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-mono text-sm mb-1">Delete Account</p>
                                <p className="text-dark-muted font-mono text-xs">
                                    Permanently delete your account and all data
                                </p>
                            </div>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="px-4 py-2 rounded border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors font-mono text-sm disabled:opacity-50"
                            >
                                DELETE_ACCOUNT
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserSettingsPage;
