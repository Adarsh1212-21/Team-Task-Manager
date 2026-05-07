import { format, isPast } from 'date-fns';

const priorityConfig = {
  high: { label: 'High', dotClass: 'bg-red-500', badgeClass: 'badge-red' },
  medium: { label: 'Medium', dotClass: 'bg-amber-500', badgeClass: 'badge-yellow' },
  low: { label: 'Low', dotClass: 'bg-emerald-500', badgeClass: 'badge-green' },
};

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const TaskCard = ({ task, onClick, compact = false }) => {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const isOverdue = task.deadline && task.status !== 'done' && isPast(new Date(task.deadline));

  if (compact) {
    return (
      <div
        onClick={() => onClick?.(task)}
        className="task-card-kanban relative"
      >
   
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${priority.dotClass}`} />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {priority.label}
            </span>
          </div>
          {isOverdue && (
            <span className="badge badge-red text-xs">Overdue</span>
          )}
        </div>


        <p className="text-sm font-semibold text-slate-800 line-clamp-2 mb-3">{task.title}</p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {task.assignedTo ? (
            <div className="flex items-center gap-1.5">
              <div className="avatar w-6 h-6 text-xs bg-blue-500">
                {getInitials(task.assignedTo.name)}
              </div>
              <span className="text-xs text-slate-500 truncate max-w-[80px]">
                {task.assignedTo.name}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Unassigned</span>
          )}

          {task.deadline && (
            <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
              {format(new Date(task.deadline), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick?.(task)}
      className="card card-hover cursor-pointer animate-fade-in"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-slate-800 line-clamp-2 flex-1 mr-2">{task.title}</h3>
        <span className={`badge ${priority.badgeClass} flex-shrink-0`}>{priority.label}</span>
      </div>

      {task.description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400">
        {task.assignedTo && (
          <div className="flex items-center gap-1.5">
            <div className="avatar w-6 h-6 text-xs bg-blue-500">
              {getInitials(task.assignedTo.name)}
            </div>
            <span>{task.assignedTo.name}</span>
          </div>
        )}
        {task.deadline && (
          <span className={`font-medium ${isOverdue ? 'text-red-500' : ''}`}>
            Due {format(new Date(task.deadline), 'MMM d, yyyy')}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
