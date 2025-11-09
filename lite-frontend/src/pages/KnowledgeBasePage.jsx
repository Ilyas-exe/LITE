import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import FileTree from '../components/FileTree';
import Viewer from '../components/Viewer';

function KnowledgeBasePage() {
    const { user, logout } = useContext(AuthContext);
    const [tree, setTree] = useState({ subFolders: [], notes: [], documents: [] });
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTree();
    }, []);

    const fetchTree = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/kb/tree', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTree(data);
            }
        } catch (error) {
            console.error('Error fetching tree:', error);
        }
    };

    const handleItemClick = (item, type, folderPath = []) => {
        setSelectedItem({ ...item, folderPath });
        setSelectedType(type);
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
                        <h1 className="text-lg font-medium text-white font-mono">KNOWLEDGE_BASE</h1>
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
            <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">
                {/* Sidebar */}
                <aside className="col-span-3 animate-slide-up">
                    <div className="card sticky top-24">
                        <h3 className="text-sm uppercase tracking-wider text-dark-muted font-medium mb-4 font-mono">
                            FILES
                        </h3>
                        <FileTree
                            tree={tree}
                            onItemClick={handleItemClick}
                            onRefresh={fetchTree}
                        />
                    </div>
                </aside>

                {/* Main Viewer */}
                <main className="col-span-9 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <Viewer
                        item={selectedItem}
                        type={selectedType}
                        onRefresh={fetchTree}
                    />
                </main>
            </div>
        </div>
    );
}

export default KnowledgeBasePage;
