import { useState } from 'react';

function JobTable({ jobs, onRefresh }) {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [uploadingId, setUploadingId] = useState(null);

    const handleEdit = (job) => {
        setEditingId(job.id);
        setEditForm({
            company: job.company,
            role: job.role,
            status: job.status,
            dateApplied: job.dateApplied
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSaveEdit = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/jobs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(editForm)
            });

            if (!response.ok) {
                throw new Error('Failed to update job');
            }

            setEditingId(null);
            setEditForm({});
            onRefresh(); // Refresh the list
        } catch (error) {
            console.error('Error updating job:', error);
            alert('Failed to update job application');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job application?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/jobs/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete job');
            }

            onRefresh(); // Refresh the list
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job application');
        }
    };

    const handleUploadCV = async (id, file) => {
        if (!file) {
            alert('Please select a file');
            return;
        }

        // Check file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setUploadingId(id);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`http://localhost:8080/api/jobs/${id}/upload-cv`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload CV');
            }

            alert('CV uploaded successfully! ✅');
            onRefresh(); // Refresh the list
        } catch (error) {
            console.error('Error uploading CV:', error);
            alert('Failed to upload CV');
        } finally {
            setUploadingId(null);
        }
    };

    const handleFileSelect = (id) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                handleUploadCV(id, file);
            }
        };
        input.click();
    };

    const getStatusBadge = (status) => {
        const styles = {
            Applied: 'badge-info',
            Interview: 'badge-warning',
            Offer: 'badge-success',
            Rejected: 'bg-red-500/10 text-red-400 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium'
        };
        return styles[status] || 'badge-info';
    };

    if (jobs.length === 0) {
        return (
            <div className="card text-center py-16">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-white mb-2 font-mono">NO_APPLICATIONS</h3>
                <p className="text-sm text-dark-muted font-mono">Start tracking to stay organized</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {jobs.map((job) => (
                <div key={job.id} className="card">
                    {editingId === job.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm uppercase tracking-wider text-dark-muted font-medium font-mono">EDIT_MODE</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs uppercase tracking-wider text-dark-muted font-medium">Company</label>
                                    <input
                                        type="text"
                                        value={editForm.company}
                                        onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs uppercase tracking-wider text-dark-muted font-medium">Role</label>
                                    <input
                                        type="text"
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs uppercase tracking-wider text-dark-muted font-medium">Status</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="Applied">Applied</option>
                                        <option value="Interview">Interview</option>
                                        <option value="Offer">Offer</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs uppercase tracking-wider text-dark-muted font-medium">Date</label>
                                    <input
                                        type="date"
                                        value={editForm.dateApplied}
                                        onChange={(e) => setEditForm({ ...editForm, dateApplied: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-dark-border">
                                <button onClick={() => handleSaveEdit(job.id)} className="btn-primary flex-1">
                                    SAVE
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="flex-1 px-5 py-2.5 rounded-md border border-dark-border text-dark-muted hover:text-white hover:border-white transition-colors font-mono text-sm"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    ) : (
                        // View Mode
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-base font-medium text-white mb-1 font-mono">{job.company}</h3>
                                    <p className="text-sm text-dark-muted font-mono">{job.role}</p>
                                </div>
                                <span className={getStatusBadge(job.status)}>
                                    {job.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-dark-muted font-mono border-t border-dark-border pt-3">
                                <div>
                                    APPLIED: {new Date(job.dateApplied).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    {job.cvUrl ? (
                                        <a
                                            href={job.cvUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-accent-blue hover:underline"
                                        >
                                            VIEW_CV
                                        </a>
                                    ) : (
                                        <span>NO_CV</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleFileSelect(job.id)}
                                    disabled={uploadingId === job.id}
                                    className="flex-1 text-xs px-3 py-2 rounded border border-dark-border text-dark-muted hover:text-accent-blue hover:border-accent-blue transition-colors font-mono disabled:opacity-50"
                                >
                                    {uploadingId === job.id ? 'UPLOADING...' : 'UPLOAD_CV'}
                                </button>
                                <button
                                    onClick={() => handleEdit(job)}
                                    className="flex-1 text-xs px-3 py-2 rounded border border-dark-border text-dark-muted hover:text-white hover:border-white transition-colors font-mono"
                                >
                                    EDIT
                                </button>
                                <button
                                    onClick={() => handleDelete(job.id)}
                                    className="flex-1 text-xs px-3 py-2 rounded border border-dark-border text-dark-muted hover:text-red-400 hover:border-red-400 transition-colors font-mono"
                                >
                                    DELETE
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default JobTable;
