import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { taskAPI, commentAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../socket/socket';
import Loader from './Loader';

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const priorityConfig = {
  high: { label: 'High', class: 'badge-red' },
  medium: { label: 'Medium', class: 'badge-yellow' },
  low: { label: 'Low', class: 'badge-green' },
};

const statusConfig = {
  todo: { label: 'To Do', class: 'badge-gray' },
  'in-progress': { label: 'In Progress', class: 'badge-blue' },
  done: { label: 'Done', class: 'badge-green' },
};

const TaskModal = ({ taskId, onClose, onUpdate, onDelete, members = [], isAdmin }) => {
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const commentsEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, commentsRes] = await Promise.all([
          taskAPI.getOne(taskId),
          commentAPI.getTaskComments(taskId),
        ]);
        setTask(taskRes.data);
        setComments(commentsRes.data);
        setEditData({
          title: taskRes.data.title,
          description: taskRes.data.description || '',
          status: taskRes.data.status,
          priority: taskRes.data.priority,
          deadline: taskRes.data.deadline ? taskRes.data.deadline.split('T')[0] : '',
          assignedTo: taskRes.data.assignedTo?._id || '',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Socket real-time comments
    const socket = getSocket();
    socket.emit('join_task', taskId);
    socket.on('comment_added', (comment) => {
      if (comment.task === taskId || comment.task?._id === taskId) {
        setComments((prev) => [...prev, comment]);
      }
    });
    socket.on('comment_deleted', ({ commentId }) => {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    });

    return () => {
      socket.emit('leave_task', taskId);
      socket.off('comment_added');
      socket.off('comment_deleted');
    };
  }, [taskId]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSave = async () => {
    try {
      setSubmitting(true);
      const res = await taskAPI.update(taskId, editData);
      setTask(res.data);
      setEditMode(false);
      onUpdate?.(res.data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await taskAPI.update(taskId, { status });
      setTask(res.data);
      onUpdate?.(res.data);
    } catch (_) {}
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      setSubmitting(true);
      await commentAPI.add(taskId, { content: commentText.trim() });
      setCommentText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await commentAPI.delete(commentId);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    await taskAPI.delete(taskId);
    onDelete?.(taskId);
    onClose();
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content flex items-center justify-center h-64" onClick={(e) => e.stopPropagation()}>
          <Loader />
        </div>
      </div>
    );
  }

  const canEdit = isAdmin || task?.createdBy?._id === user?._id;
  const canUpdateStatus = isAdmin || task?.assignedTo?._id === user?._id;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex-1 mr-4">
            {editMode ? (
              <input
                className="input-field text-lg font-bold"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                autoFocus
              />
            ) : (
              <h2 className="text-xl font-bold text-slate-800">{task?.title}</h2>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge ${statusConfig[task?.status]?.class}`}>
                {statusConfig[task?.status]?.label}
              </span>
              <span className={`badge ${priorityConfig[task?.priority]?.class}`}>
                {priorityConfig[task?.priority]?.label}
              </span>
              {task?.isOverdue && <span className="badge badge-red">Overdue</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && !editMode && (
              <button onClick={() => setEditMode(true)} className="btn-ghost text-xs px-2.5 py-1.5">
                Edit
              </button>
            )}
            {isAdmin && (
              <button onClick={handleDelete} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Description */}
          <div>
            <label className="input-label">Description</label>
            {editMode ? (
              <textarea
                className="input-field resize-none"
                rows={3}
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-slate-600">{task?.description || 'No description provided.'}</p>
            )}
          </div>

          {/* Edit fields */}
          {editMode && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Status</label>
                <select
                  className="input-field"
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="input-label">Priority</label>
                <select
                  className="input-field"
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="input-label">Deadline</label>
                <input
                  type="date"
                  className="input-field"
                  value={editData.deadline}
                  onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Assigned To</label>
                <select
                  className="input-field"
                  value={editData.assignedTo}
                  onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

   
          {!editMode && canUpdateStatus && (
            <div>
              <label className="input-label">Update Status</label>
              <div className="flex gap-2">
                {['todo', 'in-progress', 'done'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      task?.status === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {statusConfig[s].label}
                  </button>
                ))}
              </div>
            </div>
          )}

     
          {!editMode && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Assigned To</p>
                {task?.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <div className="avatar w-7 h-7 text-xs bg-blue-500">{getInitials(task.assignedTo.name)}</div>
                    <span className="text-slate-700 font-medium">{task.assignedTo.name}</span>
                  </div>
                ) : (
                  <span className="text-slate-400">Unassigned</span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Deadline</p>
                <span className={`font-medium ${task?.isOverdue ? 'text-red-500' : 'text-slate-700'}`}>
                  {task?.deadline ? format(new Date(task.deadline), 'MMM d, yyyy') : 'No deadline'}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Created By</p>
                <span className="text-slate-700 font-medium">{task?.createdBy?.name || 'Unknown'}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Created</p>
                <span className="text-slate-700">
                  {task?.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : '-'}
                </span>
              </div>
            </div>
          )}

 
          {editMode && (
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditMode(false)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          )}


          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3">
              Comments ({comments.length})
            </h3>
            <div className="space-y-3 max-h-52 overflow-y-auto mb-4">
              {comments.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No comments yet. Be the first!</p>
              )}
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 animate-fade-in">
                  <div className="avatar w-8 h-8 text-xs bg-blue-500 flex-shrink-0">
                    {getInitials(comment.author?.name)}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-700">{comment.author?.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                        </span>
                        {(comment.author?._id === user?._id || isAdmin) && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{comment.content}</p>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>

       
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || submitting}
                className="btn-primary px-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
