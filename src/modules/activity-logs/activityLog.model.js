const mongoose = require('mongoose');

const activityLogSchema =
    new mongoose.Schema(
        {
            module: {
                type: String,
                required: true,
            },

            action: {
                type: String,
                required: true,
            },

            description: {
                type: String,
                required: true,
            },

            recordId: {
                type:
                    mongoose.Schema.Types.ObjectId,
                default: null,
            },

            performedBy: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },

            metadata: {
                type: Object,
                default: {},
            },
        },
        {
            timestamps: true,
        }
    );

module.exports = mongoose.model(
    'ActivityLog',
    activityLogSchema
);