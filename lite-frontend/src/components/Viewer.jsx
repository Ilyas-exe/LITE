import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Document, Page, pdfjs } from 'react-pdf';
import './Viewer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function Viewer({ item, type, onRefresh }) {
    const [note, setNote] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [viewMode, setViewMode] = useState('preview'); // 'preview', 'edit', 'split'
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [numPages, setNumPages] = useState(null);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [folders, setFolders] = useState([]);

    useEffect(() => {
        if (type === 'note' && item) {
            fetchNote(item.id);
        } else {
            setNote(null);
        }
    }, [item, type]);

    useEffect(() => {
        if (showMoveModal) {
            fetchFolders();
        }
    }, [showMoveModal]);

    const fetchFolders = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/kb', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setFolders(buildFolderList(data.subFolders));
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };

    const buildFolderList = (folders, depth = 0) => {
        let result = [];
        for (let folder of folders) {
            result.push({ ...folder, depth });
            if (folder.subFolders && folder.subFolders.length > 0) {
                result = result.concat(buildFolderList(folder.subFolders, depth + 1));
            }
        }
        return result;
    };

    const fetchNote = async (noteId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/kb/notes/${noteId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setNote(data);
                setEditTitle(data.title);
                setEditContent(data.content || '');
            }
        } catch (error) {
            console.error('Error fetching note:', error);
        }
    };

    const handleSaveNote = async () => {
        if (!note) return;

        try {
            const response = await fetch(`http://localhost:8080/api/kb/notes/${note.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: editTitle,
                    content: editContent
                })
            });

            if (response.ok) {
                const updatedNote = await response.json();
                setNote(updatedNote);
                setIsEditing(false);
                onRefresh();
            }
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    if (!item) {
        return (
            <div className="viewer-empty">
                <p>Select a note or document to view</p>
            </div>
        );
    }

    if (type === 'note' && note) {
        return (
            <div className="viewer-container">
                {item.folderPath && item.folderPath.length > 0 && (
                    <div className="breadcrumb">
                        <span className="breadcrumb-item">📁 Root</span>
                        {item.folderPath.map((folder, index) => (
                            <span key={folder.id} className="breadcrumb-item">
                                <span className="breadcrumb-separator">›</span>
                                {folder.name}
                            </span>
                        ))}
                    </div>
                )}
                <div className="viewer-header">
                    <h2>{note.title}</h2>
                    <div className="viewer-actions">
                        {!isEditing ? (
                            <button onClick={() => { setIsEditing(true); setViewMode('split'); }} className="btn-edit-note">
                                ✏️ Edit
                            </button>
                        ) : (
                            <>
                                <div className="view-mode-toggle">
                                    <button
                                        onClick={() => setViewMode('edit')}
                                        className={`btn-view-mode ${viewMode === 'edit' ? 'active' : ''}`}
                                        title="Edit Only"
                                    >
                                        📝
                                    </button>
                                    <button
                                        onClick={() => setViewMode('split')}
                                        className={`btn-view-mode ${viewMode === 'split' ? 'active' : ''}`}
                                        title="Split View"
                                    >
                                        ⚏
                                    </button>
                                    <button
                                        onClick={() => setViewMode('preview')}
                                        className={`btn-view-mode ${viewMode === 'preview' ? 'active' : ''}`}
                                        title="Preview Only"
                                    >
                                        👁️
                                    </button>
                                </div>
                                <button onClick={() => { setIsEditing(false); setViewMode('preview'); }} className="btn-cancel-note">
                                    Cancel
                                </button>
                                <button onClick={handleSaveNote} className="btn-save-note">
                                    💾 Save
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <div className={`note-editor-wrapper ${viewMode}`}>
                        {(viewMode === 'edit' || viewMode === 'split') && (
                            <div className="editor-panel">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="edit-title-input"
                                    placeholder="Note title"
                                />
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="edit-content-textarea"
                                    placeholder="Write your markdown content here..."
                                />
                            </div>
                        )}
                        {(viewMode === 'preview' || viewMode === 'split') && (
                            <div className="preview-panel">
                                <h3 className="preview-title">{editTitle || 'Untitled'}</h3>
                                <div className="markdown-container">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                    >
                                        {editContent || '*No content yet*'}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="markdown-container">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                        >
                            {note.content || '*No content yet*'}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        );
    }

    const handleDeleteDocument = async () => {
        if (!item || type !== 'document') return;

        if (!window.confirm(`Are you sure you want to delete "${item.fileName}"?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/kb/documents/${item.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                onRefresh();
            }
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    const handleMoveDocument = async (destinationFolderId) => {
        if (!item || type !== 'document') return;

        try {
            const response = await fetch(`http://localhost:8080/api/kb/documents/${item.id}/move`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    newFolderId: destinationFolderId
                })
            });

            if (response.ok) {
                setShowMoveModal(false);
                onRefresh();
            }
        } catch (error) {
            console.error('Error moving document:', error);
        }
    };

    if (type === 'document' && item) {
        return (
            <div className="viewer-container">
                {item.folderPath && item.folderPath.length > 0 && (
                    <div className="breadcrumb">
                        <span className="breadcrumb-item">📁 Root</span>
                        {item.folderPath.map((folder, index) => (
                            <span key={folder.id} className="breadcrumb-item">
                                <span className="breadcrumb-separator">›</span>
                                {folder.name}
                            </span>
                        ))}
                    </div>
                )}
                <div className="viewer-header">
                    <h2>📄 {item.fileName}</h2>
                    <div className="viewer-actions">
                        <a href={item.documentUrl} target="_blank" rel="noopener noreferrer" className="btn-open-external">
                            Open in New Tab
                        </a>
                        <button onClick={() => setShowMoveModal(true)} className="btn-move">
                            Move
                        </button>
                        <button onClick={handleDeleteDocument} className="btn-delete">
                            Delete
                        </button>
                    </div>
                </div>

                <div className="pdf-container">
                    {item.fileName.toLowerCase().endsWith('.pdf') ? (
                        <Document
                            file={item.documentUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="pdf-document"
                        >
                            {Array.from(new Array(numPages), (el, index) => (
                                <Page
                                    key={`page_${index + 1}`}
                                    pageNumber={index + 1}
                                    width={800}
                                    className="pdf-page"
                                />
                            ))}
                        </Document>
                    ) : (
                        <div className="non-pdf-viewer">
                            <p>This file type cannot be previewed.</p>
                            <a href={item.documentUrl} target="_blank" rel="noopener noreferrer" className="btn-download">
                                Download File
                            </a>
                        </div>
                    )}
                </div>

                {showMoveModal && (
                    <div className="modal-overlay" onClick={() => setShowMoveModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Move Document</h3>
                            <p>Select destination folder for <strong>{item.fileName}</strong>:</p>
                            <div className="folder-list">
                                <div
                                    className="folder-item"
                                    onClick={() => handleMoveDocument(null)}
                                >
                                    📁 Root
                                </div>
                                {folders.map(folder => (
                                    <div
                                        key={folder.id}
                                        className="folder-item"
                                        style={{ paddingLeft: `${folder.depth * 20 + 10}px` }}
                                        onClick={() => handleMoveDocument(folder.id)}
                                    >
                                        📁 {folder.name}
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setShowMoveModal(false)} className="btn-cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
}

export default Viewer;
