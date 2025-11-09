import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Document, Page, pdfjs } from 'react-pdf';
import { exportNoteToMarkdown, exportNoteToPDF } from '../utils/exportUtils';
import { searchNotesForLink, insertAtCursor } from '../utils/noteLinking';
import NoteLinkAutocomplete from './NoteLinkAutocomplete';
import BacklinksPanel from './BacklinksPanel';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function Viewer({ item, type, onRefresh, allNotes = [], onNavigateToNote }) {
    const [note, setNote] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [viewMode, setViewMode] = useState('preview'); // 'preview', 'edit', 'split'
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [numPages, setNumPages] = useState(null);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [folders, setFolders] = useState([]);

    // Wiki-style linking state
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [autocompleteQuery, setAutocompleteQuery] = useState('');
    const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
    const [linkStartPosition, setLinkStartPosition] = useState(0);
    const textareaRef = useRef(null);

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
                setShowAutocomplete(false);
                onRefresh();
            }
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    // Handle textarea input for wiki-style linking
    const handleContentChange = (e) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;

        setEditContent(value);

        // Check if user is typing [[ for wiki-style link
        const textBeforeCursor = value.slice(0, cursorPos);
        const lastOpenBrackets = textBeforeCursor.lastIndexOf('[[');

        if (lastOpenBrackets !== -1) {
            const textAfterBrackets = textBeforeCursor.slice(lastOpenBrackets + 2);

            // Check if there's a closing ]] before cursor
            if (!textAfterBrackets.includes(']]')) {
                // Get cursor position on screen
                const textarea = e.target;
                const rect = textarea.getBoundingClientRect();
                const lineHeight = 24; // Approximate line height
                const lines = textBeforeCursor.split('\n').length;

                setAutocompleteQuery(textAfterBrackets);
                setLinkStartPosition(lastOpenBrackets + 2);
                setAutocompletePosition({
                    top: rect.top + (lines * lineHeight) + 30,
                    left: rect.left + 20
                });
                setShowAutocomplete(true);
                return;
            }
        }

        setShowAutocomplete(false);
    };

    // Insert selected note title from autocomplete
    const handleSelectNoteLink = (noteTitle) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const beforeLink = editContent.slice(0, linkStartPosition);
        const afterCursor = editContent.slice(textarea.selectionStart);

        const newContent = beforeLink + noteTitle + ']]' + afterCursor;
        setEditContent(newContent);
        setShowAutocomplete(false);

        // Set cursor after the inserted link
        setTimeout(() => {
            const newCursorPos = beforeLink.length + noteTitle.length + 2;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
        }, 0);
    };

    // Get autocomplete suggestions
    const autocompleteSuggestions = showAutocomplete
        ? searchNotesForLink(autocompleteQuery, allNotes)
        : [];

    // Custom text renderer to handle wiki-style links
    const WikiLinkText = ({ children }) => {
        if (typeof children !== 'string') return <>{children}</>;

        const parts = [];
        const linkRegex = /\[\[([^\]]+)\]\]/g;
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(children)) !== null) {
            // Add text before the link
            if (match.index > lastIndex) {
                parts.push(children.slice(lastIndex, match.index));
            }

            const noteTitle = match[1].trim();
            const linkedNote = allNotes.find(n => n.title === noteTitle);

            // Add the wiki link
            parts.push(
                <button
                    key={match.index}
                    onClick={() => linkedNote && onNavigateToNote && onNavigateToNote(linkedNote.id)}
                    className={`
                        inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-sm
                        transition-all duration-200
                        ${linkedNote
                            ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40 hover:bg-accent-blue/30 hover:border-accent-blue cursor-pointer'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30 cursor-not-allowed'
                        }
                    `}
                    disabled={!linkedNote}
                    title={linkedNote ? `Go to: ${noteTitle}` : `Note not found: ${noteTitle}`}
                >
                    <span>{linkedNote ? '🔗' : '❌'}</span>
                    {noteTitle}
                </button>
            );

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < children.length) {
            parts.push(children.slice(lastIndex));
        }

        return <>{parts}</>;
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
                            <>
                                <button
                                    onClick={() => exportNoteToMarkdown(note)}
                                    className="px-3 py-2 rounded border border-dark-border text-dark-muted hover:text-accent-blue hover:border-accent-blue transition-colors font-mono text-xs"
                                    title="Export as Markdown"
                                >
                                    MD
                                </button>
                                <button
                                    onClick={() => exportNoteToPDF(note)}
                                    className="px-3 py-2 rounded border border-dark-border text-dark-muted hover:text-accent-blue hover:border-accent-blue transition-colors font-mono text-xs"
                                    title="Export as PDF"
                                >
                                    PDF
                                </button>
                                <button
                                    onClick={() => { setIsEditing(true); setViewMode('split'); }}
                                    className="px-4 py-2 rounded bg-accent-orange/10 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/20 hover:border-accent-orange transition-colors font-mono text-sm"
                                >
                                    EDIT
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        if (textareaRef.current) {
                                            insertAtCursor(textareaRef.current, '[[]]');
                                            // Move cursor between brackets
                                            const pos = textareaRef.current.selectionStart - 2;
                                            textareaRef.current.setSelectionRange(pos, pos);
                                            textareaRef.current.focus();
                                        }
                                    }}
                                    className="px-3 py-2 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/20 hover:border-accent-blue transition-colors font-mono text-xs"
                                    title="Insert Wiki Link [[]]"
                                >
                                    🔗 LINK
                                </button>
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
                                    onClick={() => { setIsEditing(false); setViewMode('preview'); setShowAutocomplete(false); }}
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
                                <div className="relative">
                                    <textarea
                                        ref={textareaRef}
                                        value={editContent}
                                        onChange={handleContentChange}
                                        className="w-full min-h-[500px] px-4 py-3 bg-dark-bg border border-dark-border rounded text-dark-text font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-accent-blue transition-colors"
                                        placeholder="Write your markdown content here... (Tip: Use [[Note Title]] to link to other notes)"
                                    />
                                    <NoteLinkAutocomplete
                                        isOpen={showAutocomplete}
                                        suggestions={autocompleteSuggestions}
                                        onSelect={handleSelectNoteLink}
                                        onClose={() => setShowAutocomplete(false)}
                                        position={autocompletePosition}
                                    />
                                </div>
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
                                        p: ({ node, children, ...props }) => (
                                            <p className="text-dark-text mb-4 leading-relaxed" {...props}>
                                                <WikiLinkText>{children}</WikiLinkText>
                                            </p>
                                        ),
                                        li: ({ node, children, ...props }) => (
                                            <li className="text-dark-text" {...props}>
                                                <WikiLinkText>{children}</WikiLinkText>
                                            </li>
                                        ),
                                        ul: ({ node, ...props }) => <ul className="list-disc list-inside text-dark-text mb-4 space-y-2" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-dark-text mb-4 space-y-2" {...props} />,
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
                    <div className="space-y-4">
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-white mb-4 mt-6" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-white mb-3 mt-5" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mb-2 mt-4" {...props} />,
                                    p: ({ node, children, ...props }) => (
                                        <p className="text-dark-text mb-4 leading-relaxed" {...props}>
                                            <WikiLinkText>{children}</WikiLinkText>
                                        </p>
                                    ),
                                    ul: ({ node, ...props }) => <ul className="list-disc list-inside text-dark-text mb-4 space-y-2" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-dark-text mb-4 space-y-2" {...props} />,
                                    li: ({ node, children, ...props }) => (
                                        <li className="text-dark-text" {...props}>
                                            <WikiLinkText>{children}</WikiLinkText>
                                        </li>
                                    ),
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

                        {/* Backlinks Panel */}
                        <BacklinksPanel
                            currentNote={note}
                            allNotes={allNotes}
                            onNavigateToNote={onNavigateToNote}
                        />
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
