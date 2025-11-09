import TaskCard from './TaskCard';

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TODO COLUMN */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-4 py-2 border-b border-accent-blue/30">
                    <h3 className="text-sm font-medium text-white font-mono uppercase tracking-wider">Todo</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-accent-blue/10 text-accent-blue font-mono">{todoTasks.length}</span>
                </div>
                <div className="space-y-3">
                    {todoTasks.length === 0 ? (
                        <div className="card text-center py-8">
                            <p className="text-dark-muted font-mono text-xs">No tasks</p>
                        </div>
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

            {/* IN PROGRESS COLUMN */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-4 py-2 border-b border-accent-orange/30">
                    <h3 className="text-sm font-medium text-white font-mono uppercase tracking-wider">Progress</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-accent-orange/10 text-accent-orange font-mono">{inProgressTasks.length}</span>
                </div>
                <div className="space-y-3">
                    {inProgressTasks.length === 0 ? (
                        <div className="card text-center py-8">
                            <p className="text-dark-muted font-mono text-xs">No tasks</p>
                        </div>
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

            {/* DONE COLUMN */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-4 py-2 border-b border-accent-green/30">
                    <h3 className="text-sm font-medium text-white font-mono uppercase tracking-wider">Done</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-accent-green/10 text-accent-green font-mono">{doneTasks.length}</span>
                </div>
                <div className="space-y-3">
                    {doneTasks.length === 0 ? (
                        <div className="card text-center py-8">
                            <p className="text-dark-muted font-mono text-xs">No tasks</p>
                        </div>
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
