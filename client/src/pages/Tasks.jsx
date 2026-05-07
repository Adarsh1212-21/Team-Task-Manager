import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { taskAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal';
import Loader from '../components/Loader';

const statusConfig = {
  todo: { label: 'To Do', class: 'badge-gray', dot: 'bg-slate-400' },
  'in-progress': { label: 'In Progress', class: 'badge-blue', dot: 'bg-blue-500' },
  done: { label: 'Done', class: 'badge-green', dot: 'bg-emerald-500' },
};

const priorityConfig = {
  high: { label: 'High', class: 'badge-red', dot: 'bg-red-500' },
  medium: { label: 'Medium', class: 'badge-yellow', dot: 'bg-amber-500' },
  low: { label: 'Low', class: 'badge-green', dot: 'bg-emerald-500' },
};

const TaskRow = ({ task, onClick }) => {
  const isOverdue = task.deadline && task.status !== 'done' && isPast(new Date(task.deadline));
  const status = statusConfig[task.status] || statusConfig.todo;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div
      onClick={() => onClick(task._id)}
      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl hover:bg-blue-50/50 transition-colors cursor-pointer border border-transparent hover:border-blue-100 group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${priority.dot}`} />
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors line-clamp-1">
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap ml-5 sm:ml-0">
        {task.project && (
          <Link
            to={`/projects/${task.project._id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: task.project.color || '#3b82f6' }}
            />
            {task.project.name}
          </Link>
        )}
        <span className={`badge ${priority.class}`}>{priority.label}</span>
        <span className={`badge ${status.class}`}>{status.label}</span>
        {isOverdue && <span className="badge badge-red">Overdue</span>}
        {task.deadline && (
          <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
            {format(new Date(task.deadline), 'MMM d, yyyy')}
          </span>
        )}
      </div>
    </div>
  );
};

const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchTasks = async () => {
    try {
      const { data } = await taskAPI.getMyTasks();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleTaskUpdate = (updated) => {
    setTasks((prev) => prev.map((t) => t._id === updated._id ? { ...t, ...updated } : t));
  };

  const handleTaskDelete = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    setSelectedTask(null);
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchPriority = !priorityFilter || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });


  const overdue = filtered.filter((t) => t.deadline && t.status !== 'done' && isPast(new Date(t.deadline)));
  const active = filtered.filter((t) => t.status === 'in-progress');
  const todo = filtered.filter((t) => t.status === 'todo' && !(t.deadline && isPast(new Date(t.deadline))));
  const done = filtered.filter((t) => t.status === 'done');

  const TaskGroup = ({ title, tasks: groupTasks, dot, empty }) => {
    if (groupTasks.length === 0 && !empty) return null;
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
          <h3 className="text-sm font-bold text-slate-600">{title}</h3>
          <span className="badge badge-gray">{groupTasks.length}</span>
        </div>
        {groupTasks.length === 0 ? (
          <p className="text-sm text-slate-400 pl-4 mb-6">{empty}</p>
        ) : (
          <div className="space-y-1 mb-6">
            {groupTasks.map((t) => (
              <TaskRow key={t._id} task={t} onClick={setSelectedTask} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <Loader fullScreen text="Loading tasks..." />;

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="page-title">My Tasks</h1>
        <p className="text-slate-500 text-sm mt-1">
          {tasks.length} tasks assigned to you
        </p>
      </div>


      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'All Tasks', value: tasks.length, color: 'bg-blue-50 text-blue-700 border-blue-100' },
          { label: 'In Progress', value: tasks.filter((t) => t.status === 'in-progress').length, color: 'bg-sky-50 text-sky-700 border-sky-100' },
          { label: 'Overdue', value: tasks.filter((t) => t.deadline && t.status !== 'done' && isPast(new Date(t.deadline))).length, color: 'bg-red-50 text-red-700 border-red-100' },
          { label: 'Completed', value: tasks.filter((t) => t.status === 'done').length, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-3 border ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-semibold opacity-75 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>


      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="input-field pl-10"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select className="input-field w-auto" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {(search || statusFilter || priorityFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); }}
              className="btn-ghost text-slate-500"
            >
              Clear
            </button>
          )}
        </div>
      </div>


      <div className="card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-lg font-bold text-slate-600">
              {search || statusFilter || priorityFilter ? 'No tasks match your filters' : 'No tasks assigned to you'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {!search && !statusFilter && !priorityFilter ? 'Ask your project admin to assign tasks to you.' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <>
            <TaskGroup title="Overdue" tasks={overdue} dot="bg-red-500" />
            <TaskGroup title="In Progress" tasks={active} dot="bg-blue-500" empty="No tasks in progress" />
            <TaskGroup title="To Do" tasks={todo} dot="bg-slate-400" empty="No pending tasks" />
            <TaskGroup title="Completed" tasks={done} dot="bg-emerald-500" />
          </>
        )}
      </div>

      {selectedTask && (
        <TaskModal
          taskId={selectedTask}
          isAdmin={isAdmin}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  );
};

export default Tasks;
