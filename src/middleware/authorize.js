const AppError = require('../common/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

const authorize = (...requiredPermissions) => {
    return (req, res, next) => {
        const user = req.user;


        if (!user || !user.role) {
            return next(
                new AppError(
                    'Access denied',
                    HTTP_STATUS.FORBIDDEN
                )
            );
        }

        const SUPER_ADMIN_ROLE_ID ="45da3198-101f-408a-97c8-8293c1cd0c9d";

        if (user.role === SUPER_ADMIN_ROLE_ID) {
            return next();
        }


        // Extract permission names from populated role.permissions
        const userPermissions = (user.role.permissions || []).map(
            (permission) =>
                typeof permission === 'string'
                    ? permission
                    : permission.name
        );

        const hasPermission = requiredPermissions.some(
            (permission) =>
                userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    HTTP_STATUS.FORBIDDEN
                )
            );
        }

        next();
    };
};

module.exports = authorize;