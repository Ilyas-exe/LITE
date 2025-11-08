import { useState } from 'react';
import './AddTaskModal.css';

function AddTaskModal({ isOpen, onClose, onTaskAdded }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'TODO',
        dueDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.title.trim()) {
            setError('Title is required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    status: formData.status,
                    dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            // Reset form
            setFormData({
                title: '',
                description: '',
                status: 'TODO',
                dueDate: ''
            });

            onTaskAdded();
            onClose();
        } catch (err) {
            setError(err.message);
            console.error('Error creating task:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>➕ Create New Task</h2>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>

                {error && (
                    <div className="form-error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Finish project documentation"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Add more details... (optional)"
                            rows="4"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="dueDate">Due Date</label>
                            <input
                                type="date"
                                id="dueDate"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? '⏳ Creating...' : '✓ Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddTaskModal;
