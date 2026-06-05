const {
    body,
} = require('express-validator');

const {
    PROJECT_STATUSES,
    PROJECT_PRIORITIES,
} = require('./project.constants');


const createProjectValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage(
            'Project name is required'
        ),

    body('description')
        .optional()
        .trim(),

    body('status')
        .optional()
        .isIn(PROJECT_STATUSES)
        .withMessage(
            'Invalid project status'
        ),

    body('priority')
        .optional()
        .isIn(PROJECT_PRIORITIES)
        .withMessage(
            'Invalid project priority'
        ),

    body('startDate')
        .optional()
        .isISO8601()
        .withMessage(
            'Invalid start date'
        ),

    body('endDate')
        .optional()
        .isISO8601()
        .withMessage(
            'Invalid end date'
        ),

    body('projectManager')
        .optional()
        .isMongoId()
        .withMessage(
            'Invalid project manager ID'
        ),

    body('teamMembers')
        .optional()
        .isArray()
        .withMessage(
            'Team members must be an array'
        ),

    body('teamMembers.*')
        .optional()
        .isMongoId()
        .withMessage(
            'Invalid team member ID'
        ),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage(
            'isActive must be boolean'
        ),
];



const updateProjectValidation = [
    body('name')
        .optional()
        .trim(),

    body('description')
        .optional()
        .trim(),

    body('status')
        .optional()
        .isIn(PROJECT_STATUSES)
        .withMessage(
            'Invalid project status'
        ),

    body('priority')
        .optional()
        .isIn(PROJECT_PRIORITIES)
        .withMessage(
            'Invalid project priority'
        ),

    body('startDate')
        .optional()
        .isISO8601()
        .withMessage(
            'Invalid start date'
        ),

    body('endDate')
        .optional()
        .isISO8601()
        .withMessage(
            'Invalid end date'
        ),

    body('projectManager')
        .optional()
        .isMongoId()
        .withMessage(
            'Invalid project manager ID'
        ),

    body('teamMembers')
        .optional()
        .isArray()
        .withMessage(
            'Team members must be an array'
        ),

    body('teamMembers.*')
        .optional()
        .isMongoId()
        .withMessage(
            'Invalid team member ID'
        ),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage(
            'isActive must be boolean'
        ),
];

const assignMembersValidation = [
    body('teamMembers')
        .isArray({
            min: 1,
        })
        .withMessage(
            'teamMembers must be a non-empty array'
        ),

    body('teamMembers.*')
        .isMongoId()
        .withMessage(
            'Invalid team member ID'
        ),
];

const removeMemberValidation = [
    body('userId')
        .notEmpty()
        .withMessage(
            'User ID is required'
        )

        .isMongoId()
        .withMessage(
            'Invalid user ID'
        ),
];

const changeProjectManagerValidation = [
    body('projectManager')
        .notEmpty()
        .withMessage(
            'Project manager ID is required'
        )

        .isMongoId()
        .withMessage(
            'Invalid project manager ID'
        ),
];

module.exports = {
    createProjectValidation,
    updateProjectValidation,
    assignMembersValidation,
    removeMemberValidation,
    changeProjectManagerValidation
};