import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { taskAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const StatCard = ({ label, value, icon, color, subLabel }) => (
  <div className="card flex items-center gap-4 animate-slide-up">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      {subLabel && <p className="text-xs text-slate-400 mt-0.5">{subLabel}</p>}
    </div>
  </div>
);

const statusConfig = {
  todo: { label: 'To Do', class: 'badge-gray' },
  'in-progress': { label: 'In Progress', class: 'badge-blue' },
  done: { label: 'Done', class: 'badge-green' },
};

const priorityDot = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskAPI.getDashboard()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen text="Loading dashboard..." />;

  const { stats = {}, recentTasks = [] } = data || {};
  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
 
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Good {getGreeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Here's what's happening with your projects today.
          </p>
        </div>
        <Link to="/projects" className="btn-primary hidden sm:inline-flex">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

  
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={stats.total || 0}
          color="bg-blue-100"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Completed"
          value={stats.completed || 0}
          color="bg-emerald-100"
          subLabel={`${completionRate}% done`}
          icon={
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress || 0}
          color="bg-sky-100"
          icon={
            <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatCard
          label="Overdue"
          value={stats.overdue || 0}
          color="bg-red-100"
          icon={
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
   
        <div className="card lg:col-span-1">
          <h2 className="section-title mb-4">Overall Progress</h2>
          <div className="flex items-center justify-center py-6">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="url(#progressGrad)" strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - completionRate / 100)}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">{completionRate}%</span>
                <span className="text-xs text-slate-500 font-medium">Complete</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'To Do', value: stats.todo || 0, color: 'bg-slate-300', total: stats.total },
              { label: 'In Progress', value: stats.inProgress || 0, color: 'bg-blue-500', total: stats.total },
              { label: 'Completed', value: stats.completed || 0, color: 'bg-emerald-500', total: stats.total },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

     
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">No tasks yet</p>
              <p className="text-slate-400 text-sm mt-1">Create a project and add tasks to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => {
                const isOverdue = task.deadline && task.status !== 'done' && isPast(new Date(task.deadline));
                return (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">
                          {task.project?.name || 'Unknown Project'}
                        </span>
                        {task.deadline && (
                          <span className={`text-xs ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                            · {format(new Date(task.deadline), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`badge text-xs flex-shrink-0 ${statusConfig[task.status]?.class}`}>
                      {statusConfig[task.status]?.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>


      <div className="card">
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'View Projects', to: '/projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'text-blue-600 bg-blue-50' },
            { label: 'My Tasks', to: '/tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Team Members', to: '/team', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-violet-600 bg-violet-50' },
            { label: 'New Project', to: '/projects', icon: 'M12 4v16m8-8H4', color: 'text-sky-600 bg-sky-50' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-all hover:-translate-y-0.5 ${action.color}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
              </svg>
              <span className="text-sm font-semibold">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export default Dashboard;
