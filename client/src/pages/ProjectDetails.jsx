import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI, activityAPI, authAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../socket/socket';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import { StatusPieChart, PriorityBarChart, MemberBarChart } from '../components/Charts';
import Loader from '../components/Loader';
import { format } from 'date-fns';



const getInitials = (name = '') => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
const avatarColors = ['bg-blue-500','bg-sky-500','bg-indigo-500','bg-violet-500','bg-teal-500'];
const getColor = (name='') => avatarColors[name.charCodeAt(0) % avatarColors.length];

const TaskFormModal = ({ projectId, members, onClose, onCreated }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium',
    deadline: '', assignedTo: '', project: projectId,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Task title is required'); return; }
    setSaving(true);
    try {
      const { data } = await taskAPI.create(form);
      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Create Task</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
          <div>
            <label className="input-label">Task Title *</label>
            <input className="input-field" placeholder="What needs to be done?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Optional description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Status</label>
              <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="input-label">Priority</label>
              <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="input-label">Deadline</label>
              <input type="date" className="input-field" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Assign To</label>
              <select className="input-field" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {members.map((m) => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Creating...' : 'Create Task'}
            </button>
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddMemberModal = ({ projectId, currentMembers, onClose, onAdded }) => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState('');
  const [role, setRole] = useState('member');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authAPI.getAllUsers().then(({ data }) => {
      const memberIds = currentMembers.map((m) => m.user?._id);
      setUsers(data.filter((u) => !memberIds.includes(u._id)));
    });
  }, [currentMembers]);

  const handleAdd = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { data } = await projectAPI.addMember(projectId, { userId: selected, role });
      onAdded(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Add Team Member</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="input-label">Select User</label>
            <select className="input-field" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Choose a user...</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Role</label>
            <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={saving || !selected} className="btn-primary flex-1">
              {saving ? 'Adding...' : 'Add Member'}
            </button>
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TABS = ['Board', 'Analytics', 'Members', 'Activity'];

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Board');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const isProjectAdmin = isAdmin || project?.owner?._id === user?._id ||
    project?.members?.some((m) => m.user?._id === user?._id && m.role === 'admin');

  const fetchData = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        projectAPI.getOne(id),
        taskAPI.getProjectTasks(id),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === 'Analytics') {
      projectAPI.getAnalytics(id).then(({ data }) => setAnalytics(data));
    }
    if (activeTab === 'Activity') {
      activityAPI.getProjectActivities(id).then(({ data }) => setActivities(data));
    }
  }, [activeTab, id]);

  // Socket.IO real-time updates
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join_project', id);

    socket.on('task_created', (task) => 
  setTasks((prev) => 
    prev.some((t) => t._id === task._id) ? prev : [task, ...prev]
  )
);

    socket.on('task_updated', (task) => setTasks((prev) => prev.map((t) => t._id === task._id ? task : t)));
    socket.on('task_deleted', ({ taskId }) => setTasks((prev) => prev.filter((t) => t._id !== taskId)));
    socket.on('member_added', (proj) => setProject(proj));
    socket.on('member_removed', (proj) => setProject(proj));

    return () => {
      socket.emit('leave_project', id);
      socket.off('task_created');
      socket.off('task_updated');
      socket.off('task_deleted');
      socket.off('member_added');
      socket.off('member_removed');
    };
  }, [id]);

  const handleTaskMove = async (taskId, newStatus, order) => {
    try {
      await taskAPI.update(taskId, { status: newStatus, order });
      setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (_) {}
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks((prev) => prev.map((t) => t._id === updatedTask._id ? updatedTask : t));
  };

  const handleTaskDelete = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    const { data } = await projectAPI.removeMember(id, userId);
    setProject(data);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = !priorityFilter || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  if (loading) return <Loader fullScreen text="Loading project..." />;
  if (!project) return (
    <div className="text-center py-20">
      <p className="text-slate-500 text-lg font-medium">Project not found.</p>
      <button onClick={() => navigate('/projects')} className="btn-primary mt-4">Back to Projects</button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <button onClick={() => navigate('/projects')} className="btn-ghost text-slate-500 self-start">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Projects
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: project.color || '#3b82f6' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="page-title">{project.name}</h1>
              {project.description && <p className="text-slate-500 text-sm mt-0.5">{project.description}</p>}
            </div>
          </div>
   
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-blue rounded-full transition-all duration-700"
                style={{ width: `${project.taskStats?.progress || 0}%` }}
              />
            </div>
            <span className="text-sm font-bold text-blue-600 flex-shrink-0">{project.taskStats?.progress || 0}%</span>
          </div>
        </div>
        {isProjectAdmin && (
          <button onClick={() => setShowTaskForm(true)} className="btn-primary flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        )}
      </div>

    
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: project.taskStats?.total || 0, color: 'text-slate-700 bg-slate-50' },
          { label: 'To Do', value: project.taskStats?.todo || 0, color: 'text-slate-600 bg-slate-50' },
          { label: 'In Progress', value: project.taskStats?.inProgress || 0, color: 'text-blue-700 bg-blue-50' },
          { label: 'Done', value: project.taskStats?.done || 0, color: 'text-emerald-700 bg-emerald-50' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-3 border border-slate-100 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-semibold opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex border-b border-slate-200 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>


      {activeTab === 'Board' && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input className="input-field pl-10" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="input-field w-auto" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <KanbanBoard
            tasks={filteredTasks}
            onTaskClick={(t) => setSelectedTask(t._id)}
            onTaskMove={handleTaskMove}
            canMove={isProjectAdmin || true}
          />
        </div>
      )}

            {activeTab === 'Analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="section-title mb-4">Task Status</h3>
            {analytics ? <StatusPieChart data={analytics.statusBreakdown || {}} /> : <Loader />}
          </div>
          <div className="card">
            <h3 className="section-title mb-4">Priority Breakdown</h3>
            {analytics ? <PriorityBarChart data={analytics.priorityBreakdown || {}} /> : <Loader />}
          </div>
          {analytics?.memberStats?.length > 0 && (
            <div className="card md:col-span-2">
              <h3 className="section-title mb-4">Member Performance</h3>
              <MemberBarChart data={analytics.memberStats} />
            </div>
          )}
          {analytics && (
            <div className="card md:col-span-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Tasks', value: analytics.total, color: 'text-slate-700' },
                  { label: 'Completed', value: analytics.statusBreakdown?.done || 0, color: 'text-emerald-600' },
                  { label: 'Overdue', value: analytics.overdueTasks, color: 'text-red-500' },
                  { label: 'Progress', value: `${analytics.progress}%`, color: 'text-blue-600' },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

   
      {activeTab === 'Members' && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Team Members ({project.members?.length || 0})</h3>
            {isProjectAdmin && (
              <button onClick={() => setShowAddMember(true)} className="btn-primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add Member
              </button>
            )}
          </div>
          <div className="space-y-3">
            {project.members?.map((m) => (
              <div key={m.user?._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`avatar w-10 h-10 text-sm ${getColor(m.user?.name)}`}>
                    {getInitials(m.user?.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {m.user?.name}
                      {m.user?._id === project.owner?._id && (
                        <span className="ml-2 text-xs text-blue-500 font-medium">Owner</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{m.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${m.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>{m.role}</span>
                  {isProjectAdmin && m.user?._id !== project.owner?._id && (
                    <button
                      onClick={() => handleRemoveMember(m.user?._id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Activity' && (
        <div className="card">
          <h3 className="section-title mb-5">Activity Log</h3>
          {activities.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No activity recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {activities.map((log) => (
                <div key={log._id} className="flex gap-3 animate-fade-in">
                  <div className={`avatar w-8 h-8 text-xs flex-shrink-0 ${getColor(log.user?.name)}`}>
                    {getInitials(log.user?.name)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{log.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{log.user?.name}</span>
                      <span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-slate-400">
                        {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

     
      {selectedTask && (
        <TaskModal
          taskId={selectedTask}
          members={project.members || []}
          isAdmin={isProjectAdmin}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}

   
      {showTaskForm && (
        <TaskFormModal
          projectId={id}
          members={project.members || []}
          onClose={() => setShowTaskForm(false)}
          onCreated={(task) => setTasks((prev) => 
  prev.some((t) => t._id === task._id) ? prev : [task, ...prev]
)}
        />
      )}

    
      {showAddMember && (
        <AddMemberModal
          projectId={id}
          currentMembers={project.members || []}
          onClose={() => setShowAddMember(false)}
          onAdded={setProject}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
