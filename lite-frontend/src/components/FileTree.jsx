import React, { useState } from 'react';
import './FileTree.css';

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

    const handleCreateNote = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/kb/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: 'Untitled',
                    content: '',
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
                // For documents, we need a different approach - update via a move endpoint
                // Since the current backend doesn't support this, we'll skip document moving for now
                alert('Moving documents is not yet supported');
                setShowMoveModal(false);
                setMoveItem(null);
                return;
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
                <option value={folder.id}>{indent}📁 {folder.name}</option>
                {folder.subFolders?.map(subFolder => renderFolderSelectOptions(subFolder, depth + 1))}
            </React.Fragment>
        );
    };

    // Recursive helper to render folder options in the move modal
    const renderFolderOptions = (folder, depth = 0) => {
        return (
            <div key={folder.id}>
                <div
                    className="folder-option"
                    style={{ paddingLeft: `${depth * 20}px` }}
                    onClick={() => handleMoveToFolder(folder.id)}
                >
                    📁 {folder.name}
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
            <div key={folder.id} className="tree-folder" style={{ marginLeft: `${depth * 20}px` }}>
                <div className={`tree-item folder-item ${isActive ? 'active-folder' : ''}`}>
                    <span
                        onClick={() => {
                            toggleFolder(folder.id);
                            setActiveFolder(folder.id); // Set as active folder when clicked
                        }}
                        className="folder-toggle"
                    >
                        {isExpanded ? '📂' : '📁'} {folder.name}
                        {itemCount > 0 && <span className="item-count">{itemCount}</span>}
                    </span>
                    <button
                        onClick={() => handleDelete(folder.id, 'folder')}
                        className="btn-delete-small"
                    >
                        ×
                    </button>
                </div>

                {isExpanded && (
                    <div className="tree-children">
                        {folder.subFolders?.map(subFolder => renderFolder(subFolder, depth + 1, currentPath))}
                        {folder.notes?.map(note => (
                            <div key={note.id} className="tree-item note-item" style={{ marginLeft: `${(depth + 1) * 20}px` }}>
                                <span onClick={() => onItemClick(note, 'note', currentPath)}>
                                    📝 {note.title}
                                </span>
                                <div className="item-actions">
                                    <button
                                        onClick={() => {
                                            setMoveItem({ id: note.id, type: 'note' });
                                            setShowMoveModal(true);
                                        }}
                                        className="btn-move-small"
                                        title="Move to folder"
                                    >
                                        ↔
                                    </button>
                                    <button
                                        onClick={() => handleDelete(note.id, 'note')}
                                        className="btn-delete-small"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                        {folder.documents?.map(doc => (
                            <div key={doc.id} className="tree-item doc-item" style={{ marginLeft: `${(depth + 1) * 20}px` }}>
                                <span onClick={() => onItemClick(doc, 'document', currentPath)}>
                                    📄 {doc.fileName}
                                </span>
                                <div className="item-actions">
                                    <button
                                        onClick={() => handleDelete(doc.id, 'document')}
                                        className="btn-delete-small"
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
        <div className="file-tree">
            <div className="tree-header">
                <h3>Files</h3>
                <div className="tree-actions">
                    <button onClick={expandAll} className="btn-tree-action-small" title="Expand All">
                        ⊞
                    </button>
                    <button onClick={collapseAll} className="btn-tree-action-small" title="Collapse All">
                        ⊟
                    </button>
                    <button onClick={() => setShowNewFolderModal(true)} className="btn-tree-action" title="New Folder">
                        📁+
                    </button>
                    <button onClick={handleCreateNote} className="btn-tree-action" title={activeFolder ? "New Note in selected folder" : "New Note"}>
                        📝+
                    </button>
                    <button onClick={() => setShowUploadModal(true)} className="btn-tree-action" title={activeFolder ? "Upload to selected folder" : "Upload Document"}>
                        📤
                    </button>
                </div>
            </div>
            {activeFolder && (
                <div className="active-folder-indicator">
                    Creating in: <strong>{getFolderName(activeFolder)}</strong>
                    <button onClick={() => setActiveFolder(null)} className="btn-clear-folder">×</button>
                </div>
            )}

            <div className="tree-content">
                {/* Render root-level notes */}
                {tree.notes?.map(note => (
                    <div key={note.id} className="tree-item note-item">
                        <span onClick={() => onItemClick(note, 'note')}>
                            📝 {note.title}
                        </span>
                        <div className="item-actions">
                            <button
                                onClick={() => {
                                    setMoveItem({ id: note.id, type: 'note' });
                                    setShowMoveModal(true);
                                }}
                                className="btn-move-small"
                                title="Move to folder"
                            >
                                ↔
                            </button>
                            <button
                                onClick={() => handleDelete(note.id, 'note')}
                                className="btn-delete-small"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}

                {/* Render root-level documents */}
                {tree.documents?.map(doc => (
                    <div key={doc.id} className="tree-item doc-item">
                        <span onClick={() => onItemClick(doc, 'document')}>
                            📄 {doc.fileName}
                        </span>
                        <div className="item-actions">
                            <button
                                onClick={() => handleDelete(doc.id, 'document')}
                                className="btn-delete-small"
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
                <div className="modal-overlay" onClick={() => setShowNewFolderModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>New Folder</h3>
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="Folder name"
                            autoFocus
                        />
                        <div className="folder-parent-select">
                            <label>Create in:</label>
                            <select
                                value={selectedFolderId || ''}
                                onChange={(e) => setSelectedFolderId(e.target.value ? Number(e.target.value) : null)}
                            >
                                <option value="">📁 Root (Top Level)</option>
                                {tree.subFolders?.map(folder => renderFolderSelectOptions(folder))}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setShowNewFolderModal(false)}>Cancel</button>
                            <button onClick={handleCreateFolder}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Upload Document</h3>
                        <input
                            type="file"
                            onChange={(e) => setUploadFile(e.target.files[0])}
                        />
                        {uploadFile && <p className="file-selected">Selected: {uploadFile.name}</p>}
                        <div className="modal-actions">
                            <button onClick={() => {
                                setShowUploadModal(false);
                                setUploadFile(null);
                            }}>Cancel</button>
                            <button onClick={handleUploadDocument}>Upload</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Move Modal */}
            {showMoveModal && (
                <div className="modal-overlay" onClick={() => setShowMoveModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Move to Folder</h3>
                        <p className="modal-description">Select a destination folder:</p>
                        <div className="folder-picker">
                            <div
                                className="folder-option"
                                onClick={() => handleMoveToFolder(null)}
                            >
                                📁 Root (Top Level)
                            </div>
                            {tree.subFolders?.map(folder => renderFolderOptions(folder))}
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setShowMoveModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FileTree;
