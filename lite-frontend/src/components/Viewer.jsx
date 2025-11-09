import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Document, Page, pdfjs } from 'react-pdf';

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
            <div className="flex items-center justify-center py-20 text-dark-muted font-mono text-sm">
                Select a note or document to view
            </div>
        );
    }

    if (type === 'note' && note) {
        return (
            <div className="card">
                {/* Title Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-border">
                    <h1 className="text-2xl font-medium text-white font-mono truncate flex-1 mr-4">
                        {isEditing ? editTitle || 'Untitled' : note.title}
                    </h1>
                    <div className="flex items-center gap-2">
                        {!isEditing ? (
                            <button
                                onClick={() => { setIsEditing(true); setViewMode('split'); }}
                                className="px-4 py-2 rounded bg-accent-orange/10 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/20 hover:border-accent-orange transition-colors font-mono text-sm"
                            >
                                EDIT
                            </button>
                        ) : (
                            <>
                                <div className="flex items-center gap-1 border border-dark-border rounded overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('edit')}
                                        className={`px-3 py-1.5 text-xs font-mono transition-colors ${viewMode === 'edit' ? 'bg-accent-blue text-black' : 'text-dark-muted hover:text-white'}`}
                                        title="Edit"
                                    >
                                        EDIT
                                    </button>
                                    <button
                                        onClick={() => setViewMode('split')}
                                        className={`px-3 py-1.5 text-xs font-mono transition-colors ${viewMode === 'split' ? 'bg-accent-blue text-black' : 'text-dark-muted hover:text-white'}`}
                                        title="Split"
                                    >
                                        SPLIT
                                    </button>
                                    <button
                                        onClick={() => setViewMode('preview')}
                                        className={`px-3 py-1.5 text-xs font-mono transition-colors ${viewMode === 'preview' ? 'bg-accent-blue text-black' : 'text-dark-muted hover:text-white'}`}
                                        title="Preview"
                                    >
                                        VIEW
                                    </button>
                                </div>
                                <button
                                    onClick={() => { setIsEditing(false); setViewMode('preview'); }}
                                    className="px-4 py-2 rounded border border-dark-border text-dark-muted hover:text-white hover:border-white transition-colors font-mono text-sm"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleSaveNote}
                                    className="px-4 py-2 rounded bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20 hover:border-accent-green transition-colors font-mono text-sm"
                                >
                                    SAVE
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <div className={`grid ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                        {(viewMode === 'edit' || viewMode === 'split') && (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded text-white font-mono text-lg focus:outline-none focus:border-accent-blue transition-colors"
                                    placeholder="Note title"
                                />
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full min-h-[500px] px-4 py-3 bg-dark-bg border border-dark-border rounded text-dark-text font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-accent-blue transition-colors"
                                    placeholder="Write your markdown content here..."
                                />
                            </div>
                        )}
                        {(viewMode === 'preview' || viewMode === 'split') && (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw]}
                                    components={{
                                        h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-white mb-4 mt-6" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-white mb-3 mt-5" {...props} />,
                                        h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mb-2 mt-4" {...props} />,
                                        p: ({ node, ...props }) => <p className="text-dark-text mb-4 leading-relaxed" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc list-inside text-dark-text mb-4 space-y-2" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-dark-text mb-4 space-y-2" {...props} />,
                                        li: ({ node, ...props }) => <li className="text-dark-text" {...props} />,
                                        code: ({ node, inline, className, children, ...props }) => {
                                            const match = /language-(\w+)/.exec(className || '');
                                            const language = match ? match[1] : '';
                                            const isInline = inline || !className;
                                            return isInline ? (
                                                <code className="px-1.5 py-0.5 bg-red-500/10 rounded text-red-400 font-mono text-xs" {...props}>
                                                    {children}
                                                </code>
                                            ) : (
                                                <div className="my-4 rounded-lg overflow-hidden border border-dark-border">
                                                    {language && (
                                                        <div className="px-4 py-2 bg-dark-bg border-b border-dark-border text-dark-muted font-mono text-xs">
                                                            {language}
                                                        </div>
                                                    )}
                                                    <pre className="p-4 bg-[#0d0d0d] overflow-x-auto">
                                                        <code className="text-dark-text font-mono text-sm leading-relaxed" {...props}>
                                                            {children}
                                                        </code>
                                                    </pre>
                                                </div>
                                            );
                                        },
                                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-accent-blue pl-4 italic text-dark-muted mb-4" {...props} />,
                                        table: ({ node, ...props }) => <table className="w-full border-collapse border border-dark-border mb-4" {...props} />,
                                        th: ({ node, ...props }) => <th className="border border-dark-border px-3 py-2 bg-dark-bg text-left text-white font-mono text-xs" {...props} />,
                                        td: ({ node, ...props }) => <td className="border border-dark-border px-3 py-2 text-dark-text text-sm" {...props} />,
                                        a: ({ node, ...props }) => <a className="text-accent-blue hover:underline" {...props} />,
                                        strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                                        em: ({ node, ...props }) => <em className="italic text-dark-text" {...props} />,
                                    }}
                                >
                                    {editContent || '*No content yet*'}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-white mb-4 mt-6" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-white mb-3 mt-5" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mb-2 mt-4" {...props} />,
                                p: ({ node, ...props }) => <p className="text-dark-text mb-4 leading-relaxed" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc list-inside text-dark-text mb-4 space-y-2" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-dark-text mb-4 space-y-2" {...props} />,
                                li: ({ node, ...props }) => <li className="text-dark-text" {...props} />,
                                code: ({ node, inline, className, children, ...props }) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const language = match ? match[1] : '';
                                    const isInline = inline || !className;
                                    return isInline ? (
                                        <code className="px-1.5 py-0.5 bg-red-500/10 rounded text-red-400 font-mono text-xs" {...props}>
                                            {children}
                                        </code>
                                    ) : (
                                        <div className="my-4 rounded-lg overflow-hidden border border-dark-border">
                                            {language && (
                                                <div className="px-4 py-2 bg-dark-bg border-b border-dark-border text-dark-muted font-mono text-xs">
                                                    {language}
                                                </div>
                                            )}
                                            <pre className="p-4 bg-[#0d0d0d] overflow-x-auto">
                                                <code className="text-dark-text font-mono text-sm leading-relaxed" {...props}>
                                                    {children}
                                                </code>
                                            </pre>
                                        </div>
                                    );
                                },
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-accent-blue pl-4 italic text-dark-muted mb-4" {...props} />,
                                table: ({ node, ...props }) => <table className="w-full border-collapse border border-dark-border mb-4" {...props} />,
                                th: ({ node, ...props }) => <th className="border border-dark-border px-3 py-2 bg-dark-bg text-left text-white font-mono text-xs" {...props} />,
                                td: ({ node, ...props }) => <td className="border border-dark-border px-3 py-2 text-dark-text text-sm" {...props} />,
                                a: ({ node, ...props }) => <a className="text-accent-blue hover:underline" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                                em: ({ node, ...props }) => <em className="italic text-dark-text" {...props} />,
                            }}
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
