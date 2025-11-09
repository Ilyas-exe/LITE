import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function GlobalSearch({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ jobs: [], tasks: [], notes: [] });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (query.length >= 2) {
            searchAll();
        } else {
            setResults({ jobs: [], tasks: [], notes: [] });
        }
    }, [query]);

    const searchAll = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Search Jobs
            const jobsRes = await fetch('http://localhost:8080/api/jobs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const jobs = jobsRes.ok ? await jobsRes.json() : [];

            // Search Tasks
            const tasksRes = await fetch('http://localhost:8080/api/tasks', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const tasks = tasksRes.ok ? await tasksRes.json() : [];

            // Search Knowledge Base
            const kbRes = await fetch('http://localhost:8080/api/kb/tree', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const kbData = kbRes.ok ? await kbRes.json() : { notes: [], documents: [] };

            // Filter results
            const lowerQuery = query.toLowerCase();
            const filteredJobs = jobs.filter(job =>
                job.company?.toLowerCase().includes(lowerQuery) ||
                job.role?.toLowerCase().includes(lowerQuery)
            );
            const filteredTasks = tasks.filter(task =>
                task.title?.toLowerCase().includes(lowerQuery) ||
                task.description?.toLowerCase().includes(lowerQuery)
            );

            // Combine notes and documents for KB search
            const allKBItems = [
                ...(kbData.notes?.map(note => ({ ...note, type: 'note' })) || []),
                ...(kbData.documents?.map(doc => ({ ...doc, type: 'document' })) || [])
            ];
            const filteredKB = allKBItems.filter(item =>
                item.title?.toLowerCase().includes(lowerQuery) ||
                item.fileName?.toLowerCase().includes(lowerQuery)
            );

            setResults({
                jobs: filteredJobs.slice(0, 5),
                tasks: filteredTasks.slice(0, 5),
                notes: filteredKB.slice(0, 5)
            });
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJobClick = (job) => {
        navigate('/job-tracker');
        onClose();
    };

    const handleTaskClick = (task) => {
        navigate('/task-manager');
        onClose();
    };

    const handleNoteClick = (note) => {
        navigate('/knowledge-base');
        onClose();
    };

    if (!isOpen) return null;

    const totalResults = results.jobs.length + results.tasks.length + results.notes.length;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-6 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl">
                {/* Search Input */}
                <div className="card mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-dark-muted font-mono text-sm">SEARCH:</span>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type to search jobs, tasks, notes..."
                            autoFocus
                            className="flex-1 bg-transparent border-none text-white font-mono text-sm focus:outline-none placeholder:text-dark-muted"
                        />
                        <button
                            onClick={onClose}
                            className="text-dark-muted hover:text-white font-mono text-sm transition-colors"
                        >
                            ESC
                        </button>
                    </div>
                </div>

                {/* Results */}
                {query.length >= 2 && (
                    <div className="card max-h-[60vh] overflow-y-auto">
                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}

                        {!loading && totalResults === 0 && (
                            <div className="text-center py-8">
                                <p className="text-dark-muted font-mono text-sm">NO_RESULTS</p>
                            </div>
                        )}

                        {!loading && totalResults > 0 && (
                            <div className="space-y-6">
                                {/* Jobs */}
                                {results.jobs.length > 0 && (
                                    <div>
                                        <h3 className="text-xs uppercase tracking-wider text-dark-muted font-medium mb-3 font-mono">
                                            JOBS ({results.jobs.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {results.jobs.map((job) => (
                                                <button
                                                    key={job.id}
                                                    onClick={() => handleJobClick(job)}
                                                    className="w-full text-left p-3 rounded border border-dark-border hover:border-accent-blue transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-white font-mono text-sm font-medium">{job.company}</p>
                                                            <p className="text-dark-muted font-mono text-xs">{job.role}</p>
                                                        </div>
                                                        <span className="badge-info">{job.status}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tasks */}
                                {results.tasks.length > 0 && (
                                    <div>
                                        <h3 className="text-xs uppercase tracking-wider text-dark-muted font-medium mb-3 font-mono">
                                            TASKS ({results.tasks.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {results.tasks.map((task) => (
                                                <button
                                                    key={task.id}
                                                    onClick={() => handleTaskClick(task)}
                                                    className="w-full text-left p-3 rounded border border-dark-border hover:border-accent-blue transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-white font-mono text-sm font-medium">{task.title}</p>
                                                            <p className="text-dark-muted font-mono text-xs truncate">{task.description}</p>
                                                        </div>
                                                        <span className="badge-warning">{task.status}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Knowledge Base */}
                                {results.notes.length > 0 && (
                                    <div>
                                        <h3 className="text-xs uppercase tracking-wider text-dark-muted font-medium mb-3 font-mono">
                                            KNOWLEDGE_BASE ({results.notes.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {results.notes.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleNoteClick(item)}
                                                    className="w-full text-left p-3 rounded border border-dark-border hover:border-accent-blue transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>{item.type === 'document' ? '📄' : '📝'}</span>
                                                        <p className="text-white font-mono text-sm font-medium">
                                                            {item.title || item.fileName}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Hint */}
                {query.length < 2 && (
                    <div className="card">
                        <p className="text-dark-muted font-mono text-xs text-center">
                            Type at least 2 characters to search
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GlobalSearch;
