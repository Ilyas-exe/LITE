import { useState } from 'react';
import './TaskCard.css';

function TaskCard({ task, onStatusChange, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });

    const handleEdit = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: editForm.title,
                    description: editForm.description,
                    status: task.status,
                    dueDate: editForm.dueDate ? `${editForm.dueDate}T00:00:00` : null
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            setIsEditing(false);
            onUpdate();
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/tasks/${task.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            onDelete();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task');
        }
    };

    const handleMoveToStatus = (newStatus) => {
        onStatusChange(task.id, newStatus);
    };

    if (isEditing) {
        return (
            <div className="task-card editing">
                <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Task title"
                    className="edit-input"
                />
                <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description (optional)"
                    className="edit-textarea"
                    rows="3"
                />
                <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="edit-input"
                />
                <div className="edit-actions">
                    <button onClick={handleEdit} className="btn-save">✓ Save</button>
                    <button onClick={() => setIsEditing(false)} className="btn-cancel">✗ Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div className="task-card">
            <div className="task-header">
                <h4>{task.title}</h4>
                <div className="task-actions">
                    <button onClick={() => setIsEditing(true)} className="btn-icon" title="Edit">
                        ✏️
                    </button>
                    <button onClick={handleDelete} className="btn-icon" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>

            {task.description && (
                <p className="task-description">{task.description}</p>
            )}

            {task.dueDate && (
                <p className="task-due-date">
                    📅 {new Date(task.dueDate).toLocaleDateString()}
                </p>
            )}

            <div className="status-actions">
                {task.status !== 'TODO' && (
                    <button onClick={() => handleMoveToStatus('TODO')} className="status-btn todo-btn">
                        ← To Do
                    </button>
                )}
                {task.status !== 'IN_PROGRESS' && (
                    <button onClick={() => handleMoveToStatus('IN_PROGRESS')} className="status-btn progress-btn">
                        ⚡ In Progress
                    </button>
                )}
                {task.status !== 'DONE' && (
                    <button onClick={() => handleMoveToStatus('DONE')} className="status-btn done-btn">
                        Done ✓
                    </button>
                )}
            </div>
        </div>
    );
}

export default TaskCard;
