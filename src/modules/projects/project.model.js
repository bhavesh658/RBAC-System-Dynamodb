const mongoose = require('mongoose');

const {
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
} = require('./project.constants');

const projectSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: [
          true,
          'Project name is required',
        ],
        trim: true,
        maxlength: [
          100,
          'Project name cannot exceed 100 characters',
        ],
      },

      description: {
        type: String,
        trim: true,
        default: '',
      },

      status: {
        type: String,
        enum: PROJECT_STATUSES,
        default: 'Planning',
      },

      priority: {
        type: String,
        enum: PROJECT_PRIORITIES,
        default: 'Medium',
      },

      startDate: {
        type: Date,
        default: null,
      },

      endDate: {
        type: Date,
        default: null,
      },

      projectManager: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },

      teamMembers: [
        {
          type:
            mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],

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


projectSchema.virtual(
  'teamMemberCount'
).get(function () {
  return this.teamMembers?.length || 0;
});

const Project = mongoose.model(
  'Project',
  projectSchema
);

module.exports = Project;