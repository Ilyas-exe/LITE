import TaskCard from './TaskCard';
import './KanbanBoard.css';

function KanbanBoard({ tasks, onTaskUpdate, onTaskDelete }) {
    // Group tasks by status
    const todoTasks = tasks.filter(task => task.status === 'TODO');
    const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS');
    const doneTasks = tasks.filter(task => task.status === 'DONE');

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            // Find the task to get all its data
            const task = tasks.find(t => t.id === taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: task.title,
                    description: task.description,
                    status: newStatus,
                    dueDate: task.dueDate
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update task status');
            }

            onTaskUpdate();
        } catch (error) {
            console.error('Error updating task status:', error);
            alert('Failed to update task status');
        }
    };

    return (
        <div className="kanban-board">
            <div className="kanban-column">
                <div className="column-header todo-header">
                    <h3>📋 To Do</h3>
                    <span className="task-count">{todoTasks.length}</span>
                </div>
                <div className="column-content">
                    {todoTasks.length === 0 ? (
                        <p className="empty-column">No tasks</p>
                    ) : (
                        todoTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onStatusChange={handleStatusChange}
                                onDelete={onTaskDelete}
                                onUpdate={onTaskUpdate}
                            />
                        ))
                    )}
                </div>
            </div>

            <div className="kanban-column">
                <div className="column-header in-progress-header">
                    <h3>⚡ In Progress</h3>
                    <span className="task-count">{inProgressTasks.length}</span>
                </div>
                <div className="column-content">
                    {inProgressTasks.length === 0 ? (
                        <p className="empty-column">No tasks</p>
                    ) : (
                        inProgressTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onStatusChange={handleStatusChange}
                                onDelete={onTaskDelete}
                                onUpdate={onTaskUpdate}
                            />
                        ))
                    )}
                </div>
            </div>

            <div className="kanban-column">
                <div className="column-header done-header">
                    <h3>✅ Done</h3>
                    <span className="task-count">{doneTasks.length}</span>
                </div>
                <div className="column-content">
                    {doneTasks.length === 0 ? (
                        <p className="empty-column">No tasks</p>
                    ) : (
                        doneTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onStatusChange={handleStatusChange}
                                onDelete={onTaskDelete}
                                onUpdate={onTaskUpdate}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default KanbanBoard;
