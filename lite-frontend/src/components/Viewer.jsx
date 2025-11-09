import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Document, Page, pdfjs } from 'react-pdf';
import './Viewer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function Viewer({ item, type, onRefresh }) {
    const [note, setNote] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [numPages, setNumPages] = useState(null);

    useEffect(() => {
        if (type === 'note' && item) {
            fetchNote(item.id);
        } else {
            setNote(null);
        }
    }, [item, type]);

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
                <div className="viewer-header">
                    <h2>{note.title}</h2>
                    <div className="viewer-actions">
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="btn-edit-note">
                                Edit
                            </button>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(false)} className="btn-cancel-note">
                                    Cancel
                                </button>
                                <button onClick={handleSaveNote} className="btn-save-note">
                                    Save
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <div className="editor-container">
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
                ) : (
                    <div className="markdown-container">
                        <ReactMarkdown>{note.content || '*No content yet*'}</ReactMarkdown>
                    </div>
                )}
            </div>
        );
    }

    if (type === 'document' && item) {
        return (
            <div className="viewer-container">
                <div className="viewer-header">
                    <h2>📄 {item.fileName}</h2>
                    <a href={item.documentUrl} target="_blank" rel="noopener noreferrer" className="btn-open-external">
                        Open in New Tab
                    </a>
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
            </div>
        );
    }

    return null;
}

export default Viewer;
