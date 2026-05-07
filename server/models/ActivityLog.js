const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'project_created',
        'project_updated',
        'project_deleted',
        'member_added',
        'member_removed',
        'task_created',
        'task_updated',
        'task_deleted',
        'task_assigned',
        'status_changed',
        'comment_added',
        'comment_deleted',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
