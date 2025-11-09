import { useState } from 'react';

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
            <div className="card">
                <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Task title"
                    className="input-field mb-3"
                />
                <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description"
                    className="input-field resize-none mb-3"
                    rows="3"
                />
                <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="input-field mb-3"
                />
                <div className="flex gap-2">
                    <button onClick={handleEdit} className="flex-1 px-3 py-2 rounded bg-accent-blue hover:bg-accent-blue/80 text-black font-mono text-xs transition-colors">
                        SAVE
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 px-3 py-2 rounded border border-dark-border text-dark-muted hover:text-white hover:border-white transition-colors font-mono text-xs">
                        CANCEL
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card group hover:border-accent-blue/50 transition-all">
            <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-medium text-white font-mono">{task.title}</h4>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsEditing(true)} className="text-xs px-2 py-1 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/20 hover:border-accent-blue transition-colors font-mono">
                        EDIT
                    </button>
                    <button onClick={handleDelete} className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500 transition-colors font-mono">
                        DEL
                    </button>
                </div>
            </div>

            {task.description && (
                <p className="text-xs text-dark-muted font-mono mb-3 leading-relaxed">{task.description}</p>
            )}

            {task.dueDate && (
                <div className="text-xs text-dark-muted font-mono mb-3 flex items-center gap-2">
                    📅 {new Date(task.dueDate).toLocaleDateString()}
                </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-dark-border">
                {task.status !== 'TODO' && (
                    <button onClick={() => handleMoveToStatus('TODO')} className="flex-1 text-xs px-2 py-1.5 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/20 hover:border-accent-blue transition-colors font-mono">
                        ← TODO
                    </button>
                )}
                {task.status !== 'IN_PROGRESS' && (
                    <button onClick={() => handleMoveToStatus('IN_PROGRESS')} className="flex-1 text-xs px-2 py-1.5 rounded bg-accent-orange/10 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/20 hover:border-accent-orange transition-colors font-mono">
                        PROGRESS
                    </button>
                )}
                {task.status !== 'DONE' && (
                    <button onClick={() => handleMoveToStatus('DONE')} className="flex-1 text-xs px-2 py-1.5 rounded bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20 hover:border-accent-green transition-colors font-mono">
                        DONE
                    </button>
                )}
            </div>
        </div>
    );
}

export default TaskCard;
