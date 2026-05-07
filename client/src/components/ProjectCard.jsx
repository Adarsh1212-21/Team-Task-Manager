import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const priorityConfig = {
  high: { label: 'High', class: 'badge-red' },
  medium: { label: 'Medium', class: 'badge-yellow' },
  low: { label: 'Low', class: 'badge-green' },
};

const statusConfig = {
  planning: { label: 'Planning', class: 'badge-gray' },
  active: { label: 'Active', class: 'badge-blue' },
  'on-hold': { label: 'On Hold', class: 'badge-yellow' },
  completed: { label: 'Completed', class: 'badge-green' },
};

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const avatarColors = ['bg-blue-500', 'bg-sky-500', 'bg-indigo-500', 'bg-violet-500', 'bg-teal-500'];
const getColor = (name = '') => avatarColors[name.charCodeAt(0) % avatarColors.length];

const ProjectCard = ({ project, onEdit, onDelete, isAdmin }) => {
  const { taskStats = {} } = project;
  const priority = priorityConfig[project.priority] || priorityConfig.medium;
  const status = statusConfig[project.status] || statusConfig.planning;

  return (
    <div className="card card-hover group animate-fade-in">
    
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: project.color || '#3B82F6' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              by {project.owner?.name || 'Unknown'}
            </p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.preventDefault(); onEdit(project); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onDelete(project._id); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

   
      {project.description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.description}</p>
      )}


      <div className="flex items-center gap-2 mb-4">
        <span className={`badge ${status.class}`}>{status.label}</span>
        <span className={`badge ${priority.class}`}>{priority.label}</span>
        {taskStats.overdue > 0 && (
          <span className="badge badge-red">{taskStats.overdue} Overdue</span>
        )}
      </div>


      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-500">Progress</span>
          <span className="text-xs font-bold text-blue-600">{taskStats.progress || 0}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-blue rounded-full transition-all duration-500"
            style={{ width: `${taskStats.progress || 0}%` }}
          />
        </div>
      </div>


      <div className="flex items-center justify-between">
  
        <div className="flex items-center">
          {project.members?.slice(0, 4).map((m, i) => (
            <div
              key={m.user?._id || i}
              className={`avatar w-7 h-7 text-xs ${getColor(m.user?.name)} border-2 border-white`}
              style={{ marginLeft: i > 0 ? '-6px' : 0 }}
              title={m.user?.name}
            >
              {getInitials(m.user?.name)}
            </div>
          ))}
          {project.members?.length > 4 && (
            <div className="avatar w-7 h-7 text-xs bg-slate-300 text-slate-600 border-2 border-white" style={{ marginLeft: '-6px' }}>
              +{project.members.length - 4}
            </div>
          )}
        </div>


        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {taskStats.total || 0} tasks
          </span>
          {project.deadline && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {format(new Date(project.deadline), 'MMM d')}
            </span>
          )}
        </div>
      </div>

      <Link to={`/projects/${project._id}`} className="absolute inset-0 z-0" aria-label={project.name} />
    </div>
  );
};

export default ProjectCard;
