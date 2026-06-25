const { v4: uuidv4 } = require("uuid");
const activityLogRepository = require("./activityLog.repository");
const getPagination = require("../../common/pagination");

const createActivityLog = async ({
    module,
    action,
    description,
    recordId = null,
    performedBy,
    metadata = {},
}) => {

    const log = {
        logId: uuidv4(),
        module,
        action,
        description,
        recordId,
        performedBy,
        metadata,
        createdAt:
            new Date().toISOString(),
    };

    return await activityLogRepository.create(log);
};

const getAllActivityLogs =
    async (query = {}) => {

        let logs;

        if (query.module) {
            logs =
                await activityLogRepository.getByModule(
                    query.module
                );
        } else {
            logs =
                await activityLogRepository.getAll();
        }

        logs.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

        const {
            limit,
            skip,
        } = getPagination(query);

        return logs.slice(
            skip,
            skip + limit
        );
    };

module.exports = {
    createActivityLog,
    getAllActivityLogs,
};