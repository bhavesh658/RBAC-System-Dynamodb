const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const authorize = require( '../../middleware/authorize');
const validateRequest = require('../../middleware/validateRequest');
const taskController = require('./task.controller');
const validateObjectId = require('../../middleware/validateObjectId')

const {
  createTaskValidation,
  updateTaskValidation,
  assignTaskValidation,
  changeTaskStatusValidation,
} = require('./task.validation');
const { ResultWithContextImpl } = require('express-validator/lib/chain');


router.post(
  '/',
  authenticate,
  authorize('tasks.create'),
  createTaskValidation,
  validateRequest,
  taskController.createTask
);



router.get(
  '/',
  authenticate,
  authorize('tasks.read'),
  taskController.getAllTasks
);



router.get(
  '/:id',
  authenticate,
  authorize('tasks.read'),
  validateObjectId,
  taskController.getTaskById
);



router.patch(
  '/:id',
  authenticate,
  authorize('tasks.update'),
  updateTaskValidation,
  validateRequest,
  validateObjectId,
  taskController.updateTask
);



router.delete(
  '/:id',
  authenticate,
  authorize('tasks.delete'),
  validateObjectId,
  taskController.deleteTask
);



router.patch(
  '/:id/assign',
  authenticate,
  authorize('tasks.assign'),
  assignTaskValidation,
  validateRequest,
  validateObjectId,
  taskController.assignTask
);



router.patch(
  '/:id/status',
  authenticate,
  authorize('tasks.update'),
  changeTaskStatusValidation,
  validateRequest,
  validateObjectId,
  taskController.changeTaskStatus
);

module.exports = router;