import { useState, useEffect } from 'react';
import { projectAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';

const PROJECT_COLORS = [
  '#3b82f6', '#0ea5e9', '#6366f1', '#8b5cf6',
  '#10b981', '#f59e0b', '#ef4444', '#ec4899',
];

const defaultForm = {
  name: '', description: '', status: 'planning',
  priority: 'medium', deadline: '', color: '#3b82f6',
};

const ProjectFormModal = ({ initial, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState(initial || defaultForm);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initial?._id ? 'Edit Project' : 'Create Project'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="input-label">Project Name *</label>
            <input
              className="input-field"
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Brief project description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Status</label>
              <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
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
          </div>
          <div>
            <label className="input-label">Deadline</label>
            <input
              type="date"
              className="input-field"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div>
            <label className="input-label">Project Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-lg transition-all ${form.color === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onSubmit(form)}
              disabled={loading || !form.name.trim()}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving...' : initial?._id ? 'Update Project' : 'Create Project'}
            </button>
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchProjects = async () => {
    try {
      const { data } = await projectAPI.getAll();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSubmit = async (form) => {
    setSaving(true);
    try {
      if (editProject?._id) {
        const { data } = await projectAPI.update(editProject._id, form);
        setProjects((prev) => prev.map((p) => p._id === data._id ? { ...p, ...data } : p));
      } else {
        const { data } = await projectAPI.create(form);
        setProjects((prev) => [data, ...prev]);
      }
      setShowModal(false);
      setEditProject(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm('Delete this project and all its tasks?')) return;
  try {
    await projectAPI.delete(id);
    setProjects((prev) => prev.filter((p) => p._id !== id));
  } catch (err) {
    console.error('Delete error:', err.response?.status, err.response?.data);
    alert(err.response?.data?.message || 'Failed to delete project');
  }
};

  const handleEdit = (project) => {
    setEditProject({
      ...project,
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <Loader fullScreen text="Loading projects..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects.length} total projects</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditProject(null); setShowModal(true); }}
            className="btn-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        )}
      </div>


      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="input-field pl-10"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'planning', 'active', 'on-hold', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                filter === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

    
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-600">No projects found</p>
          <p className="text-slate-400 text-sm mt-1">
            {search ? 'Try a different search term' : isAdmin ? 'Create your first project to get started' : 'No projects assigned to you yet'}
          </p>
          {isAdmin && !search && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary mt-4"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <div key={project._id} className="relative">
              <ProjectCard
                project={project}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectFormModal
          initial={editProject}
          onClose={() => { setShowModal(false); setEditProject(null); }}
          onSubmit={handleSubmit}
          loading={saving}
        />
      )}
    </div>
  );
};

export default Projects;
