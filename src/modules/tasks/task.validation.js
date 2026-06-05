const { body } = require(
  'express-validator'
);

const {
  TASK_STATUSES,
  TASK_PRIORITIES,
} = require('./task.constants');



const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage(
      'Task title is required'
    ),

  body('description')
    .optional()
    .trim(),

  body('project')
    .notEmpty()
    .withMessage(
      'Project is required'
    )
    .isMongoId()
    .withMessage(
      'Invalid project ID'
    ),

  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage(
      'Invalid user ID'
    ),

  body('status')
    .optional()
    .isIn(TASK_STATUSES)
    .withMessage(
      'Invalid task status'
    ),

  body('priority')
    .optional()
    .isIn(TASK_PRIORITIES)
    .withMessage(
      'Invalid task priority'
    ),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage(
      'Invalid start date'
    ),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage(
      'Invalid due date'
    ),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage(
      'isActive must be boolean'
    ),
];



const updateTaskValidation = [
  body('title')
    .optional()
    .trim(),

  body('description')
    .optional()
    .trim(),

  body('project')
    .optional()
    .isMongoId()
    .withMessage(
      'Invalid project ID'
    ),

  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage(
      'Invalid user ID'
    ),

  body('status')
    .optional()
    .isIn(TASK_STATUSES)
    .withMessage(
      'Invalid task status'
    ),

  body('priority')
    .optional()
    .isIn(TASK_PRIORITIES)
    .withMessage(
      'Invalid task priority'
    ),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage(
      'Invalid start date'
    ),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage(
      'Invalid due date'
    ),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage(
      'isActive must be boolean'
    ),
];



const assignTaskValidation = [
  body('assignedTo')
    .notEmpty()
    .withMessage(
      'Assigned user is required'
    )
    .isMongoId()
    .withMessage(
      'Invalid user ID'
    ),
];


const changeTaskStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage(
      'Status is required'
    )
    .isIn(TASK_STATUSES)
    .withMessage(
      'Invalid task status'
    ),
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  assignTaskValidation,
  changeTaskStatusValidation,
};