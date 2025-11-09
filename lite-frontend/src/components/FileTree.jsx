import React, { useState } from 'react';
import TemplateSelector from './TemplateSelector';

function FileTree({ tree, onItemClick, onRefresh }) {
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [activeFolder, setActiveFolder] = useState(null); // Track currently selected folder for creating items
    const [moveItem, setMoveItem] = useState(null); // Item being moved: {id, type}
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);

    const toggleFolder = (folderId) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const getFolderName = (folderId) => {
        const findFolder = (folders) => {
            for (const folder of folders) {
                if (folder.id === folderId) return folder.name;
                if (folder.subFolders?.length) {
                    const found = findFolder(folder.subFolders);
                    if (found) return found;
                }
            }
            return null;
        };
        return findFolder(tree.subFolders || []) || 'Unknown';
    };

    const handleCreateFolder = async () => {
        if (!newItemName.trim()) return;

        try {
            const response = await fetch('http://localhost:8080/api/kb/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: newItemName,
                    parentFolderId: selectedFolderId
                })
            });

            if (response.ok) {
                setShowNewFolderModal(false);
                setNewItemName('');
                setSelectedFolderId(null);
                onRefresh();
            }
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    const handleCreateNoteWithTemplate = async (template) => {
        try {
            const response = await fetch('http://localhost:8080/api/kb/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: template.id === 'blank' ? 'Untitled' : template.name,
                    content: template.content,
                    folderId: activeFolder // Use currently selected folder
                })
            });

            if (response.ok) {
                const newNote = await response.json();
                await onRefresh();
                // Auto-expand folder if note was created inside one
                if (activeFolder) {
                    const newExpanded = new Set(expandedFolders);
                    newExpanded.add(activeFolder);
                    setExpandedFolders(newExpanded);
                }
                // Auto-click the new note to open it
                onItemClick(newNote, 'note');
            }
        } catch (error) {
            console.error('Error creating note:', error);
            alert('Failed to create note');
        }
    };

    const handleUploadDocument = async () => {
        if (!uploadFile) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadFile);
        if (activeFolder) {
            formData.append('folderId', activeFolder); // Use currently selected folder
        }

        try {
            const response = await fetch('http://localhost:8080/api/kb/upload-document', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                setShowUploadModal(false);
                setUploadFile(null);
                await onRefresh();
                // Auto-expand folder if document was uploaded inside one
                if (activeFolder) {
                    const newExpanded = new Set(expandedFolders);
                    newExpanded.add(activeFolder);
                    setExpandedFolders(newExpanded);
                }
                alert('Document uploaded successfully!');
            } else {
                alert('Failed to upload document');
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Error uploading document');
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Delete this ${type}?`)) return;

        try {
            let endpoint = '';
            if (type === 'folder') endpoint = `/api/kb/folders/${id}`;
            else if (type === 'note') endpoint = `/api/kb/notes/${id}`;
            else if (type === 'document') endpoint = `/api/kb/documents/${id}`;

            const response = await fetch(`http://localhost:8080${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                onRefresh();
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
        }
    };

    const handleMoveToFolder = async (destinationFolderId) => {
        if (!moveItem) return;

        try {
            let endpoint = '';
            let body = {};

            if (moveItem.type === 'note') {
                endpoint = `/api/kb/notes/${moveItem.id}`;
                // Fetch current note data first
                const noteResponse = await fetch(`http://localhost:8080${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (!noteResponse.ok) throw new Error('Failed to fetch note');
                const noteData = await noteResponse.json();
                body = {
                    title: noteData.title,
                    content: noteData.content,
                    folderId: destinationFolderId
                };
            } else if (moveItem.type === 'document') {
                // For documents, just update the folder
                endpoint = `/api/kb/documents/${moveItem.id}`;
                body = {
                    folderId: destinationFolderId
                };
            }

            const response = await fetch(`http://localhost:8080${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                setShowMoveModal(false);
                setMoveItem(null);
                await onRefresh();
                // Expand destination folder
                if (destinationFolderId) {
                    const newExpanded = new Set(expandedFolders);
                    newExpanded.add(destinationFolderId);
                    setExpandedFolders(newExpanded);
                }
            } else {
                alert('Failed to move item');
            }
        } catch (error) {
            console.error('Error moving item:', error);
            alert('Error moving item');
        }
    };

    // Recursive helper to render folder options in select dropdown
    const renderFolderSelectOptions = (folder, depth = 0) => {
        const indent = '　'.repeat(depth); // Using full-width space for indentation
        return (
            <React.Fragment key={folder.id}>
                <option value={folder.id}>{indent}{folder.name}</option>
                {folder.subFolders?.map(subFolder => renderFolderSelectOptions(subFolder, depth + 1))}
            </React.Fragment>
        );
    };

    // Recursive helper to render folder options in the move modal
    const renderFolderOptions = (folder, depth = 0) => {
        return (
            <div key={folder.id}>
                <div
                    className="px-3 py-2 text-sm font-mono text-dark-muted hover:text-white hover:bg-white/5 cursor-pointer transition-colors border-b border-dark-border"
                    style={{ paddingLeft: `${12 + depth * 20}px` }}
                    onClick={() => handleMoveToFolder(folder.id)}
                >
                    {folder.name}
                </div>
                {folder.subFolders?.map(subFolder => renderFolderOptions(subFolder, depth + 1))}
            </div>
        );
    };

    const renderFolder = (folder, depth = 0, parentPath = []) => {
        const isExpanded = expandedFolders.has(folder.id);
        const isActive = activeFolder === folder.id;
        const currentPath = [...parentPath, { id: folder.id, name: folder.name }];
        const itemCount = (folder.notes?.length || 0) + (folder.documents?.length || 0) + (folder.subFolders?.length || 0);

        return (
            <div key={folder.id} style={{ marginLeft: `${depth * 12}px` }}>
                <div className={`flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer group ${isActive ? 'bg-accent-blue/10 border-l-2 border-accent-blue' : ''}`}>
                    <span
                        onClick={() => {
                            toggleFolder(folder.id);
                            setActiveFolder(folder.id);
                        }}
                        className="flex items-center gap-2 flex-1 text-xs font-mono text-dark-muted hover:text-white transition-colors"
                    >
                        <span className="text-[10px] font-bold">{isExpanded ? '▼' : '▶'}</span>
                        <span className="truncate">{folder.name}</span>
                        {itemCount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-border text-dark-muted">{itemCount}</span>}
                    </span>
                    <button
                        onClick={() => handleDelete(folder.id, 'folder')}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs px-1 transition-opacity"
                    >
                        ×
                    </button>
                </div>

                {isExpanded && (
                    <div className="mt-1">
                        {folder.subFolders?.map(subFolder => renderFolder(subFolder, depth + 1, currentPath))}
                        {folder.notes?.map(note => (
                            <div key={note.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer group" style={{ marginLeft: `${(depth + 1) * 12}px` }}>
                                <span
                                    onClick={() => onItemClick(note, 'note', currentPath)}
                                    className="flex items-center gap-2 flex-1 text-xs font-mono text-dark-muted hover:text-white transition-colors truncate"
                                >
                                    <span className="text-[10px]">MD</span>
                                    <span className="truncate">{note.title}</span>
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setMoveItem({ id: note.id, type: 'note' });
                                            setShowMoveModal(true);
                                        }}
                                        className="text-accent-blue hover:text-accent-blue/80 text-xs px-1"
                                        title="Move"
                                    >
                                        ↔
                                    </button>
                                    <button
                                        onClick={() => handleDelete(note.id, 'note')}
                                        className="text-red-400 hover:text-red-300 text-xs px-1"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                        {folder.documents?.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer group" style={{ marginLeft: `${(depth + 1) * 12}px` }}>
                                <span
                                    onClick={() => onItemClick(doc, 'document', currentPath)}
                                    className="flex items-center gap-2 flex-1 text-xs font-mono text-dark-muted hover:text-white transition-colors truncate"
                                >
                                    <span className="text-[10px]">{doc.fileName.split('.').pop().toUpperCase().slice(0, 3)}</span>
                                    <span className="truncate">{doc.fileName}</span>
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setMoveItem({ id: doc.id, type: 'document' });
                                            setShowMoveModal(true);
                                        }}
                                        className="text-accent-blue hover:text-accent-blue/80 text-xs px-1"
                                        title="Move"
                                    >
                                        ↔
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.id, 'document')}
                                        className="text-red-400 hover:text-red-300 text-xs px-1"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const expandAll = () => {
        const allFolderIds = new Set();
        const collectFolderIds = (folders) => {
            folders.forEach(folder => {
                allFolderIds.add(folder.id);
                if (folder.subFolders?.length) {
                    collectFolderIds(folder.subFolders);
                }
            });
        };
        if (tree.subFolders) {
            collectFolderIds(tree.subFolders);
        }
        setExpandedFolders(allFolderIds);
    };

    const collapseAll = () => {
        setExpandedFolders(new Set());
    };

    return (
        <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-border">
                <div className="flex gap-1">
                    <button onClick={expandAll} className="text-xs px-2 py-1 rounded bg-dark-bg border border-dark-border text-dark-muted hover:text-white hover:border-accent-blue transition-colors font-mono" title="Expand All">
                        +
                    </button>
                    <button onClick={collapseAll} className="text-xs px-2 py-1 rounded bg-dark-bg border border-dark-border text-dark-muted hover:text-white hover:border-accent-blue transition-colors font-mono" title="Collapse All">
                        -
                    </button>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => setShowNewFolderModal(true)} className="text-xs px-2 py-1 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/20 hover:border-accent-blue transition-colors font-mono" title="New Folder">
                        DIR
                    </button>
                    <button onClick={() => setShowTemplateSelector(true)} className="text-xs px-2 py-1 rounded bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20 hover:border-accent-green transition-colors font-mono" title="New Note from Template">
                        MD
                    </button>
                    <button onClick={() => setShowUploadModal(true)} className="text-xs px-2 py-1 rounded bg-accent-orange/10 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/20 hover:border-accent-orange transition-colors font-mono" title="Upload">
                        UP
                    </button>
                </div>
            </div>

            {activeFolder && (
                <div className="flex items-center justify-between text-xs bg-accent-blue/5 border border-accent-blue/20 rounded px-2 py-1.5 mb-3 font-mono">
                    <span className="text-dark-muted">
                        Target: <span className="text-accent-blue">{getFolderName(activeFolder)}</span>
                    </span>
                    <button onClick={() => setActiveFolder(null)} className="text-dark-muted hover:text-white">×</button>
                </div>
            )}

            <div className="space-y-0.5">
                {/* Render root-level notes */}
                {tree.notes?.map(note => (
                    <div key={note.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer group">
                        <span
                            onClick={() => onItemClick(note, 'note')}
                            className="flex items-center gap-2 flex-1 text-xs font-mono text-dark-muted hover:text-white transition-colors truncate"
                        >
                            <span className="text-[10px]">MD</span>
                            <span className="truncate">{note.title}</span>
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => {
                                    setMoveItem({ id: note.id, type: 'note' });
                                    setShowMoveModal(true);
                                }}
                                className="text-accent-blue hover:text-accent-blue/80 text-xs px-1"
                                title="Move"
                            >
                                ↔
                            </button>
                            <button
                                onClick={() => handleDelete(note.id, 'note')}
                                className="text-red-400 hover:text-red-300 text-xs px-1"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}

                {/* Render root-level documents */}
                {tree.documents?.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer group">
                        <span
                            onClick={() => onItemClick(doc, 'document')}
                            className="flex items-center gap-2 flex-1 text-xs font-mono text-dark-muted hover:text-white transition-colors truncate"
                        >
                            <span className="text-[10px]">{doc.fileName.split('.').pop().toUpperCase().slice(0, 3)}</span>
                            <span className="truncate">{doc.fileName}</span>
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => {
                                    setMoveItem({ id: doc.id, type: 'document' });
                                    setShowMoveModal(true);
                                }}
                                className="text-accent-blue hover:text-accent-blue/80 text-xs px-1"
                                title="Move"
                            >
                                ↔
                            </button>
                            <button
                                onClick={() => handleDelete(doc.id, 'document')}
                                className="text-red-400 hover:text-red-300 text-xs px-1"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}

                {/* Render folders */}
                {tree.subFolders?.map(folder => renderFolder(folder))}
            </div>

            {showNewFolderModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowNewFolderModal(false)}>
                    <div className="bg-dark-bg border border-dark-border rounded-lg p-6 w-full max-w-md shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-medium text-white font-mono mb-4">New Folder</h3>
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="Folder name"
                            autoFocus
                            className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-accent-blue transition-colors mb-4"
                        />
                        <div className="mb-4">
                            <label className="block text-xs text-dark-muted font-mono mb-2">Create in:</label>
                            <select
                                value={selectedFolderId || ''}
                                onChange={(e) => setSelectedFolderId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-accent-blue transition-colors"
                            >
                                <option value="">Root (Top Level)</option>
                                {tree.subFolders?.map(folder => renderFolderSelectOptions(folder))}
                            </select>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowNewFolderModal(false)} className="px-4 py-2 rounded text-sm font-mono text-dark-muted hover:text-white border border-dark-border hover:border-white transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleCreateFolder} className="px-4 py-2 rounded text-sm font-mono bg-accent-blue text-black hover:bg-accent-blue/80 transition-colors">
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showUploadModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowUploadModal(false)}>
                    <div className="bg-dark-bg border border-dark-border rounded-lg p-6 w-full max-w-md shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-medium text-white font-mono mb-4">Upload Document</h3>
                        <input
                            type="file"
                            onChange={(e) => setUploadFile(e.target.files[0])}
                            className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-accent-blue transition-colors file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-accent-orange/10 file:text-accent-orange hover:file:bg-accent-orange/20 file:cursor-pointer mb-3"
                        />
                        {uploadFile && <p className="text-xs text-accent-green font-mono mb-4 px-3 py-2 bg-accent-green/10 border border-accent-green/30 rounded">Selected: {uploadFile.name}</p>}
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => {
                                setShowUploadModal(false);
                                setUploadFile(null);
                            }} className="px-4 py-2 rounded text-sm font-mono text-dark-muted hover:text-white border border-dark-border hover:border-white transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleUploadDocument} className="px-4 py-2 rounded text-sm font-mono bg-accent-orange text-black hover:bg-accent-orange/80 transition-colors">
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Move Modal */}
            {showMoveModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowMoveModal(false)}>
                    <div className="bg-dark-bg border border-dark-border rounded-lg p-6 w-full max-w-md shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-medium text-white font-mono mb-2">Move to Folder</h3>
                        <p className="text-xs text-dark-muted font-mono mb-4">Select a destination folder:</p>
                        <div className="max-h-64 overflow-y-auto border border-dark-border rounded mb-4 bg-dark-bg">
                            <div
                                className="px-3 py-2 text-sm font-mono text-dark-muted hover:text-white hover:bg-white/5 cursor-pointer transition-colors border-b border-dark-border"
                                onClick={() => handleMoveToFolder(null)}
                            >
                                Root (Top Level)
                            </div>
                            {tree.subFolders?.map(folder => renderFolderOptions(folder))}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowMoveModal(false)} className="px-4 py-2 rounded text-sm font-mono text-dark-muted hover:text-white border border-dark-border hover:border-white transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Selector */}
            <TemplateSelector
                isOpen={showTemplateSelector}
                onSelectTemplate={handleCreateNoteWithTemplate}
                onClose={() => setShowTemplateSelector(false)}
            />
        </div>
    );
}

export default FileTree;
