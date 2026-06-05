const ActivityLog = require(
    './activityLog.model'
);

const getPagination = require(
    '../../common/pagination'
);

const createActivityLog =
    async ({
        module,
        action,
        description,
        recordId = null,
        performedBy,
        metadata = {},
    }) => {

        return ActivityLog.create({
            module,
            action,
            description,
            recordId,
            performedBy,
            metadata,
        });
    };




const getAllActivityLogs =
    async (query = {}) => {
        const { limit, skip } = getPagination(query);

        const filter = {};

        if (query.module) {
            filter.module =
                query.module;
        }

        if (query.action) {
            filter.action =
                query.action;
        }

        if (query.performedBy) {
            filter.performedBy =
                query.performedBy;
        }

        if (query.recordId) {
            filter.recordId =
                query.recordId;
        }

        const logs =
            await ActivityLog.find(
                filter
            )
                .skip(skip)
                .limit(limit)

                .populate(
                    'performedBy',
                    'firstName lastName email'
                )

                .sort({
                    createdAt: -1,
                });

        return logs;
    };

module.exports = {
    createActivityLog,
    getAllActivityLogs,
};