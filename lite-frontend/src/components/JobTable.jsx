import { useState } from 'react';

function JobTable({ jobs, onRefresh }) {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [uploadingId, setUploadingId] = useState(null);
    const [changingStatusId, setChangingStatusId] = useState(null);

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

            if (!response.ok) throw new Error('Failed to update job');

            setEditingId(null);
            setEditForm({});
            onRefresh();
        } catch (error) {
            console.error('Error updating job:', error);
            alert('Failed to update job application');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job application?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/jobs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (!response.ok) throw new Error('Failed to delete job');
            onRefresh();
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
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload CV');

            alert('CV uploaded successfully!');
            onRefresh();
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
            if (file) handleUploadCV(id, file);
        };
        input.click();
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const job = jobs.find(j => j.id === id);
            const response = await fetch(`http://localhost:8080/api/jobs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ ...job, status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            setChangingStatusId(null);
            onRefresh();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
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
                <div className="text-4xl mb-4"></div>
                <h3 className="text-lg font-medium text-white mb-2 font-mono">NO_APPLICATIONS</h3>
                <p className="text-sm text-dark-muted font-mono">Start tracking to stay organized</p>
            </div>
        );
    }

    return (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-dark-border">
                            <th className="text-left py-3 px-4 text-xs font-medium text-dark-muted font-mono uppercase">Company</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-dark-muted font-mono uppercase">Role</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-dark-muted font-mono uppercase">Status</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-dark-muted font-mono uppercase">Date</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-dark-muted font-mono uppercase">CV</th>
                            <th className="text-right py-3 px-4 text-xs font-medium text-dark-muted font-mono uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map((job) => (
                            <tr key={job.id} className="border-b border-dark-border hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4">
                                    {editingId === job.id ? (
                                        <input
                                            type="text"
                                            value={editForm.company}
                                            onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                            className="w-full px-2 py-1 bg-dark-bg border border-accent-blue rounded text-sm text-white font-mono focus:outline-none"
                                        />
                                    ) : (
                                        <span className="text-sm text-white font-mono font-medium">{job.company}</span>
                                    )}
                                </td>
                                
                                <td className="py-3 px-4">
                                    {editingId === job.id ? (
                                        <input
                                            type="text"
                                            value={editForm.role}
                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                            className="w-full px-2 py-1 bg-dark-bg border border-accent-blue rounded text-sm text-dark-muted font-mono focus:outline-none"
                                        />
                                    ) : (
                                        <span className="text-sm text-dark-muted font-mono">{job.role}</span>
                                    )}
                                </td>
                                
                                <td className="py-3 px-4 relative">
                                    {changingStatusId === job.id ? (
                                        <select
                                            value={job.status}
                                            onChange={(e) => handleStatusChange(job.id, e.target.value)}
                                            onBlur={() => setChangingStatusId(null)}
                                            autoFocus
                                            className="px-2 py-1 bg-dark-bg border border-accent-blue rounded text-xs text-white font-mono focus:outline-none cursor-pointer"
                                        >
                                            <option value="Applied">Applied</option>
                                            <option value="Interview">Interview</option>
                                            <option value="Offer">Offer</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    ) : (
                                        <button
                                            onClick={() => setChangingStatusId(job.id)}
                                            className={`${getStatusBadge(job.status)} cursor-pointer hover:opacity-80 transition-opacity`}
                                        >
                                            {job.status.toUpperCase()}
                                        </button>
                                    )}
                                </td>
                                
                                <td className="py-3 px-4">
                                    {editingId === job.id ? (
                                        <input
                                            type="date"
                                            value={editForm.dateApplied}
                                            onChange={(e) => setEditForm({ ...editForm, dateApplied: e.target.value })}
                                            className="px-2 py-1 bg-dark-bg border border-accent-blue rounded text-sm text-dark-muted font-mono focus:outline-none"
                                        />
                                    ) : (
                                        <span className="text-sm text-dark-muted font-mono">
                                            {new Date(job.dateApplied).toLocaleDateString()}
                                        </span>
                                    )}
                                </td>
                                
                                <td className="py-3 px-4">
                                    {job.cvUrl ? (
                                        <a
                                            href={job.cvUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-accent-blue hover:underline font-mono"
                                        >
                                            VIEW
                                        </a>
                                    ) : (
                                        <span className="text-xs text-dark-muted font-mono"></span>
                                    )}
                                </td>
                                
                                <td className="py-3 px-4">
                                    <div className="flex items-center justify-end gap-2">
                                        {editingId === job.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleSaveEdit(job.id)}
                                                    className="text-xs px-2.5 py-1.5 rounded bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20 hover:border-accent-green transition-colors font-mono"
                                                >
                                                    SAVE
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="text-xs px-2.5 py-1.5 rounded border border-dark-border text-dark-muted hover:text-white hover:border-white transition-colors font-mono"
                                                >
                                                    CANCEL
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleFileSelect(job.id)}
                                                    disabled={uploadingId === job.id}
                                                    className="text-xs px-2.5 py-1.5 rounded bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20 hover:border-accent-green transition-colors font-mono disabled:opacity-50"
                                                    title="Upload CV"
                                                >
                                                    {uploadingId === job.id ? '...' : 'CV'}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(job)}
                                                    className="text-xs px-2.5 py-1.5 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/20 hover:border-accent-blue transition-colors font-mono"
                                                >
                                                    EDIT
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(job.id)}
                                                    className="text-xs px-2.5 py-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500 transition-colors font-mono"
                                                >
                                                    DEL
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default JobTable;
