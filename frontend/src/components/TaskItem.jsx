import './TaskItem.css';

const TaskItem = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const isCompleted = task.status === 'Completed';

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className={`task-item ${isCompleted ? 'completed' : ''}`}>
      <div className="task-header">
        <div className="task-title-group">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => onToggleStatus(task.id)}
            className="task-checkbox"
          />
          <h3 className={isCompleted ? 'text-strikethrough' : ''}>{task.title}</h3>
        </div>
        <div className="task-actions">
          <button className="btn-icon edit" onClick={() => onEdit(task)} aria-label="Edit task">
            ✎
          </button>
          <button className="btn-icon delete" onClick={() => onDelete(task.id)} aria-label="Delete task">
            ×
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span className={`badge status-${task.status.replace(/\s+/g, '-').toLowerCase()}`}>
          {task.status}
        </span>
        <span className={`badge priority ${getPriorityClass(task.priority)}`}>
          {task.priority} Priority
        </span>
        {task.category && (
          <span className="badge category">{task.category}</span>
        )}
        {task.dueDate && (
          <span className="task-date">📅 {new Date(task.dueDate).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
