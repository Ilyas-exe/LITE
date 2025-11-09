import { useState } from 'react';

function AddTaskModal({ onTaskAdded, onCancel }) {
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

            setFormData({
                title: '',
                description: '',
                status: 'TODO',
                dueDate: ''
            });

            onTaskAdded();
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

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white font-mono">ADD_TASK</h3>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-dark-muted hover:text-white transition-colors text-xl"
                    >
                        ×
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-500/5 border border-red-500/20 text-red-400 px-4 py-3 rounded-md text-sm font-mono mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-xs uppercase tracking-wider text-dark-muted font-medium">
                        Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Finish project documentation"
                        required
                        disabled={loading}
                        className="input-field"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="block text-xs uppercase tracking-wider text-dark-muted font-medium">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Add more details..."
                        rows="4"
                        disabled={loading}
                        className="input-field resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="status" className="block text-xs uppercase tracking-wider text-dark-muted font-medium">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={loading}
                            className="input-field"
                        >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="dueDate" className="block text-xs uppercase tracking-wider text-dark-muted font-medium">
                            Due Date
                        </label>
                        <input
                            type="date"
                            id="dueDate"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            disabled={loading}
                            className="input-field"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 rounded border border-dark-border text-dark-muted hover:text-white hover:border-white transition-colors font-mono text-sm"
                            disabled={loading}
                        >
                            CANCEL
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 rounded bg-accent-blue hover:bg-accent-blue/80 text-black font-mono text-sm font-medium transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'ADDING...' : 'ADD TASK'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddTaskModal;
