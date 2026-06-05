const mongoose = require('mongoose');

const {
  TASK_STATUSES,
  TASK_PRIORITIES,
} = require('./task.constants');

const taskSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: [
          true,
          'Task title is required',
        ],
        trim: true,
        maxlength: [
          200,
          'Task title cannot exceed 200 characters',
        ],
      },

      description: {
        type: String,
        trim: true,
        default: '',
      },

      project: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [
          true,
          'Project is required',
        ],
      },

      assignedTo: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },

      status: {
        type: String,
        enum: TASK_STATUSES,
        default: 'Todo',
      },

      priority: {
        type: String,
        enum: TASK_PRIORITIES,
        default: 'Medium',
      },

      startDate: {
        type: Date,
        default: null,
      },

      dueDate: {
        type: Date,
        default: null,
      },

      createdBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },

      updatedBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },

      isDeleted: {
        type: Boolean,
        default: false,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,

      toJSON: {
        virtuals: true,
      },

      toObject: {
        virtuals: true,
      },
    }
  );



taskSchema.virtual('isOverdue').get(
  function () {
    if (!this.dueDate) {
      return false;
    }

    return (
      this.status !== 'Completed' &&
      this.dueDate < new Date()
    );
  }
);

const Task = mongoose.model(
  'Task',
  taskSchema
);

module.exports = Task;