import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileTree from '../components/FileTree';
import Viewer from '../components/Viewer';
import './KnowledgeBasePage.css';

function KnowledgeBasePage() {
    const [tree, setTree] = useState({ subFolders: [], notes: [], documents: [] });
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedType, setSelectedType] = useState(null); // 'note' or 'document'
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

    const handleItemClick = (item, type) => {
        setSelectedItem(item);
        setSelectedType(type);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="knowledge-base-page">
            <header className="kb-header">
                <div className="kb-header-left">
                    <h1>📚 Knowledge Base</h1>
                </div>
                <div className="kb-header-right">
                    <button onClick={() => navigate('/dashboard')} className="btn-nav">Dashboard</button>
                    <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="btn-logout">
                        Logout
                    </button>
                </div>
            </header>

            <div className="kb-layout">
                <div className="kb-sidebar">
                    <FileTree
                        tree={tree}
                        onItemClick={handleItemClick}
                        onRefresh={fetchTree}
                    />
                </div>
                <div className="kb-viewer">
                    <Viewer
                        item={selectedItem}
                        type={selectedType}
                        onRefresh={fetchTree}
                    />
                </div>
            </div>
        </div>
    );
}

export default KnowledgeBasePage;
