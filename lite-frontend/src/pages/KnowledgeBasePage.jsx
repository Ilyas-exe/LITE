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
    const [viewMode, setViewMode] = useState('sidebar'); // 'sidebar' or 'grid' - TREE is default
    const [currentFolder, setCurrentFolder] = useState(null); // For grid navigation
    const [folderPath, setFolderPath] = useState([]); // Breadcrumb trail
    const [showViewModal, setShowViewModal] = useState(false);
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

    const handleItemClick = (item, type, folderPathArg = []) => {
        if (viewMode === 'grid') {
            if (type === 'folder') {
                // Navigate into folder - avoid duplicates
                const alreadyInPath = folderPath.some(f => f.id === item.id);
                if (!alreadyInPath) {
                    setCurrentFolder(item);
                    setFolderPath([...folderPath, item]);
                    fetchFolderContents(item.id);
                }
            } else {
                // Open modal for note/document
                setSelectedItem({ ...item, folderPath: folderPathArg });
                setSelectedType(type);
                setShowViewModal(true);
            }
        } else {
            // Sidebar mode - old behavior
            setSelectedItem({ ...item, folderPath: folderPathArg });
            setSelectedType(type);
        }
    };

    const fetchFolderContents = async (folderId) => {
        try {
            console.log('Fetching folder contents for ID:', folderId);
            const response = await fetch(`http://localhost:8080/api/kb/folders/${folderId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Folder contents received:', data);
                setTree(data);
            } else {
                console.error('Failed to fetch folder:', response.status);
            }
        } catch (error) {
            console.error('Error fetching folder:', error);
        }
    };

    const handleBackToParent = () => {
        if (folderPath.length === 0) return;

        const newPath = [...folderPath];
        newPath.pop();
        setFolderPath(newPath);

        if (newPath.length === 0) {
            setCurrentFolder(null);
            fetchTree();
        } else {
            const parentFolder = newPath[newPath.length - 1];
            setCurrentFolder(parentFolder);
            fetchFolderContents(parentFolder.id);
        }
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
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* View Mode Toggle */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-white font-mono">Files & Documents</h2>
                    <div className="flex items-center gap-1 border border-dark-border rounded overflow-hidden">
                        <button
                            onClick={() => setViewMode('sidebar')}
                            className={`text-xs px-3 py-1.5 font-mono transition-colors ${viewMode === 'sidebar'
                                ? 'bg-accent-blue text-black'
                                : 'text-dark-muted hover:text-white'
                                }`}
                        >
                            TREE
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`text-xs px-3 py-1.5 font-mono transition-colors ${viewMode === 'grid'
                                ? 'bg-accent-blue text-black'
                                : 'text-dark-muted hover:text-white'
                                }`}
                        >
                            GRID
                        </button>
                    </div>
                </div>

                {viewMode === 'sidebar' ? (
                    /* Sidebar Tree View */
                    <div className="grid grid-cols-12 gap-6">
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

                        <main className="col-span-9 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <Viewer
                                item={selectedItem}
                                type={selectedType}
                                onRefresh={fetchTree}
                            />
                        </main>
                    </div>
                ) : (
                    /* Grid Card View */
                    <div className="animate-slide-up">
                        {/* Breadcrumb Navigation */}
                        {folderPath.length > 0 && (
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dark-border">
                                <button
                                    onClick={handleBackToParent}
                                    className="px-4 py-2 rounded bg-dark-card border border-dark-border text-white hover:border-accent-blue transition-colors font-mono text-sm flex items-center gap-2"
                                >
                                    ← BACK
                                </button>
                                <div className="flex items-center gap-2 font-mono text-sm text-dark-muted">
                                    <span
                                        className="text-white cursor-pointer hover:text-accent-blue"
                                        onClick={() => {
                                            setFolderPath([]);
                                            setCurrentFolder(null);
                                            fetchTree();
                                        }}
                                    >
                                        Root
                                    </span>
                                    {folderPath.map((folder, idx) => (
                                        <span key={folder.id} className="flex items-center gap-2">
                                            <span>›</span>
                                            <span
                                                className={idx === folderPath.length - 1 ? 'text-accent-blue' : 'text-white cursor-pointer hover:text-accent-blue'}
                                                onClick={() => {
                                                    if (idx < folderPath.length - 1) {
                                                        // Navigate to this folder
                                                        const newPath = folderPath.slice(0, idx + 1);
                                                        setFolderPath(newPath);
                                                        setCurrentFolder(folder);
                                                        fetchFolderContents(folder.id);
                                                    }
                                                }}
                                            >
                                                {folder.name}
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {/* Folders */}
                            {tree.subFolders && tree.subFolders.map(folder => (
                                <div
                                    key={`folder-${folder.id}`}
                                    className="card hover:border-accent-blue cursor-pointer transition-all group"
                                    onClick={() => handleItemClick(folder, 'folder')}
                                >
                                    <div className="flex flex-col items-center text-center p-4">
                                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                                            📁
                                        </div>
                                        <h3 className="text-sm font-medium text-white font-mono truncate w-full">
                                            {folder.name}
                                        </h3>
                                        <p className="text-xs text-dark-muted font-mono mt-1">
                                            Folder
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Notes */}
                            {tree.notes && tree.notes.map(note => (
                                <div
                                    key={`note-${note.id}`}
                                    className="card hover:border-accent-blue cursor-pointer transition-all group"
                                    onClick={() => handleItemClick(note, 'note')}
                                >
                                    <div className="flex flex-col items-center text-center p-4">
                                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                                            📝
                                        </div>
                                        <h3 className="text-sm font-medium text-white font-mono truncate w-full">
                                            {note.title}
                                        </h3>
                                        <p className="text-xs text-dark-muted font-mono mt-1">
                                            Note
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Documents */}
                            {tree.documents && tree.documents.map(doc => (
                                <div
                                    key={`doc-${doc.id}`}
                                    className="card hover:border-accent-blue cursor-pointer transition-all group"
                                    onClick={() => handleItemClick(doc, 'document')}
                                >
                                    <div className="flex flex-col items-center text-center p-4">
                                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                                            📄
                                        </div>
                                        <h3 className="text-sm font-medium text-white font-mono truncate w-full">
                                            {doc.fileName}
                                        </h3>
                                        <p className="text-xs text-dark-muted font-mono mt-1">
                                            {doc.fileName.split('.').pop().toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State */}
                            {(!tree.subFolders || tree.subFolders.length === 0) &&
                                (!tree.notes || tree.notes.length === 0) &&
                                (!tree.documents || tree.documents.length === 0) && (
                                    <div className="col-span-full card text-center py-16">
                                        <div className="text-4xl mb-4">📂</div>
                                        <h3 className="text-lg font-medium text-white mb-2 font-mono">EMPTY</h3>
                                        <p className="text-sm text-dark-muted font-mono">No files yet</p>
                                    </div>
                                )}
                        </div>
                    </div>
                )}

                {/* 70% Modal Viewer for Grid Mode */}
                {showViewModal && selectedItem && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-6" onClick={() => setShowViewModal(false)}>
                        <div className="bg-dark-card border border-dark-border rounded-lg w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-dark-border">
                                <h3 className="text-lg font-medium text-white font-mono truncate">
                                    {selectedType === 'note' ? `📝 ${selectedItem.title}` : `📄 ${selectedItem.fileName}`}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            // Fullscreen logic (placeholder)
                                            alert('Fullscreen feature coming soon!');
                                        }}
                                        className="px-3 py-1.5 rounded bg-dark-bg border border-dark-border text-white hover:border-accent-blue transition-colors font-mono text-xs"
                                        title="Fullscreen"
                                    >
                                        ⛶
                                    </button>
                                    {selectedType === 'document' && selectedItem.documentUrl && (
                                        <a
                                            href={selectedItem.documentUrl}
                                            download
                                            className="px-3 py-1.5 rounded bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20 hover:border-accent-green transition-colors font-mono text-xs"
                                        >
                                            DOWNLOAD
                                        </a>
                                    )}
                                    <button
                                        onClick={() => {
                                            // Move logic (placeholder)
                                            alert('Move feature coming soon!');
                                        }}
                                        className="px-3 py-1.5 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/20 hover:border-accent-blue transition-colors font-mono text-xs"
                                    >
                                        MOVE
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Delete this item?')) {
                                                try {
                                                    const endpoint = selectedType === 'note' ? 'notes' : 'documents';
                                                    await fetch(`http://localhost:8080/api/kb/${endpoint}/${selectedItem.id}`, {
                                                        method: 'DELETE',
                                                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                                    });
                                                    setShowViewModal(false);
                                                    if (currentFolder) fetchFolderContents(currentFolder.id);
                                                    else fetchTree();
                                                } catch (error) {
                                                    console.error('Error deleting:', error);
                                                }
                                            }
                                        }}
                                        className="px-3 py-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500 transition-colors font-mono text-xs"
                                    >
                                        DELETE
                                    </button>
                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        className="text-dark-muted hover:text-white transition-colors text-2xl px-2"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-auto p-6">
                                <Viewer
                                    item={selectedItem}
                                    type={selectedType}
                                    onRefresh={() => {
                                        if (currentFolder) fetchFolderContents(currentFolder.id);
                                        else fetchTree();
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default KnowledgeBasePage;
