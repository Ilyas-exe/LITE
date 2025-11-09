import { findBacklinks } from '../utils/noteLinking';

/**
 * Display backlinks - notes that link to the current note
 */
function BacklinksPanel({ currentNote, allNotes, onNavigateToNote }) {
    if (!currentNote) return null;

    const backlinks = findBacklinks(currentNote.title, allNotes);

    if (backlinks.length === 0) {
        return (
            <div className="card">
                <h3 className="text-sm font-mono text-dark-muted mb-2 flex items-center gap-2">
                    <span>🔗</span>
                    BACKLINKS
                </h3>
                <p className="text-xs text-dark-muted font-mono">
                    No notes link to this note yet
                </p>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 className="text-sm font-mono text-dark-muted mb-3 flex items-center gap-2">
                <span>🔗</span>
                BACKLINKS ({backlinks.length})
            </h3>
            <div className="space-y-2">
                {backlinks.map(note => (
                    <button
                        key={note.id}
                        onClick={() => onNavigateToNote(note.id)}
                        className="w-full text-left px-3 py-2 rounded bg-dark-bg border border-dark-border hover:border-accent-blue transition-colors group"
                    >
                        <div className="flex items-start gap-2">
                            <span className="text-lg mt-0.5">📄</span>
                            <div className="flex-1 min-w-0">
                                <div className="font-mono text-sm text-white group-hover:text-accent-blue transition-colors truncate">
                                    {note.title}
                                </div>
                                {note.content && (
                                    <div className="text-xs text-dark-muted font-mono mt-1 line-clamp-2">
                                        {note.content.substring(0, 100)}...
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default BacklinksPanel;
