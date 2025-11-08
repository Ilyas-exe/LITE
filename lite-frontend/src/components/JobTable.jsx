import { useState } from 'react';
import './JobTable.css';

function JobTable({ jobs, onRefresh }) {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

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

    if (jobs.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No job applications yet</h3>
                <p>Start tracking your job applications to stay organized</p>
            </div>
        );
    }

    return (
        <div className="job-table-container">
            <table className="job-table">
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Date Applied</th>
                        <th>CV</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job) => (
                        <tr key={job.id}>
                            {editingId === job.id ? (
                                // Edit Mode
                                <>
                                    <td>
                                        <input
                                            type="text"
                                            value={editForm.company}
                                            onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                            className="edit-input"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={editForm.role}
                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                            className="edit-input"
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            className="edit-select"
                                        >
                                            <option value="Applied">Applied</option>
                                            <option value="Interview">Interview</option>
                                            <option value="Offer">Offer</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="date"
                                            value={editForm.dateApplied}
                                            onChange={(e) => setEditForm({ ...editForm, dateApplied: e.target.value })}
                                            className="edit-input"
                                        />
                                    </td>
                                    <td>
                                        {job.cvUrl ? (
                                            <a href={job.cvUrl} target="_blank" rel="noopener noreferrer" className="cv-link">
                                                View
                                            </a>
                                        ) : (
                                            <span className="no-cv">No CV</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => handleSaveEdit(job.id)} className="btn-save">
                                                ✓ Save
                                            </button>
                                            <button onClick={handleCancelEdit} className="btn-cancel">
                                                ✗ Cancel
                                            </button>
                                        </div>
                                    </td>
                                </>
                            ) : (
                                // View Mode
                                <>
                                    <td className="company-cell">{job.company}</td>
                                    <td className="role-cell">{job.role}</td>
                                    <td>
                                        <span className={`status-badge status-${job.status.toLowerCase()}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="date-cell">
                                        {new Date(job.dateApplied).toLocaleDateString()}
                                    </td>
                                    <td>
                                        {job.cvUrl ? (
                                            <a href={job.cvUrl} target="_blank" rel="noopener noreferrer" className="cv-link">
                                                📎 View CV
                                            </a>
                                        ) : (
                                            <span className="no-cv">No CV</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => handleEdit(job)} className="btn-edit">
                                                ✏️ Edit
                                            </button>
                                            <button onClick={() => handleDelete(job.id)} className="btn-delete">
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default JobTable;
