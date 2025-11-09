import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function MobileNav({ onShowShortcuts, onShowSearch, onShowBackup }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { path: '/dashboard', label: 'HOME', icon: '⌂' },
        { path: '/job-tracker', label: 'JOBS', icon: '💼' },
        { path: '/task-manager', label: 'TASKS', icon: '✓' },
        { path: '/knowledge-base', label: 'KB', icon: '📚' },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    const handleAction = (action) => {
        setIsOpen(false);
        action();
    };

    return (
        <>
            {/* Mobile Bottom Navigation - Visible on small screens */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-bg border-t border-dark-border z-40">
                <div className="flex items-center justify-around py-2">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => handleNavigate(item.path)}
                            className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${location.pathname === item.path
                                ? 'text-accent-blue'
                                : 'text-dark-muted'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-[10px] font-mono">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Mobile Hamburger Menu - Visible on small screens */}
            <div className="md:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed top-4 right-4 z-50 p-2 bg-dark-card border border-dark-border rounded hover:border-accent-blue transition-colors"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {/* Mobile Menu Overlay */}
                {isOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setIsOpen(false)}>
                        <div className="absolute top-16 right-4 bg-dark-bg border border-dark-border rounded-lg p-4 min-w-[200px] animate-slide-up" onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-2">
                                {/* Navigation Items */}
                                {navItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => handleNavigate(item.path)}
                                        className={`w-full text-left px-4 py-3 rounded font-mono text-sm transition-colors ${location.pathname === item.path
                                            ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30'
                                            : 'text-dark-muted hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="mr-2">{item.icon}</span>
                                        {item.label}
                                    </button>
                                ))}

                                {/* Divider */}
                                <div className="border-t border-dark-border my-2"></div>

                                {/* Action Items */}
                                {onShowSearch && (
                                    <button
                                        onClick={() => handleAction(onShowSearch)}
                                        className="w-full text-left px-4 py-3 rounded font-mono text-sm text-dark-muted hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <span className="mr-2">🔍</span>
                                        SEARCH
                                    </button>
                                )}
                                {onShowBackup && (
                                    <button
                                        onClick={() => handleAction(onShowBackup)}
                                        className="w-full text-left px-4 py-3 rounded font-mono text-sm text-dark-muted hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <span className="mr-2">💾</span>
                                        BACKUP
                                    </button>
                                )}
                                {onShowShortcuts && (
                                    <button
                                        onClick={() => handleAction(onShowShortcuts)}
                                        className="w-full text-left px-4 py-3 rounded font-mono text-sm text-dark-muted hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <span className="mr-2">⌨️</span>
                                        SHORTCUTS
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default MobileNav;
