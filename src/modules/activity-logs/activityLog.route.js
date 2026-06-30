const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const activityLogController =require('./activityLog.controller');

router.get(
    '/',
    authenticate,
    authorize('activitylogs.read'),
    activityLogController.getAllActivityLogs
);

module.exports = router;