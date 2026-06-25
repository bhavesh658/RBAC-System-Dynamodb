const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validateRequest = require('../../middleware/validateRequest');

const projectController = require('./project.controller');

const {
    createProjectValidation,
    updateProjectValidation,
    assignMembersValidation,
    removeMemberValidation,
    changeProjectManagerValidation
} = require('./project.validation');



router.post(
    '/',
    authenticate,
    authorize('projects.create'),
    // createProjectValidation,
    validateRequest,
    projectController.createProject
);



router.get(
    '/',
    authenticate,
    authorize('projects.read'),
    projectController.getAllProjects
);



router.get(
    '/:id',
    authenticate,
    authorize('projects.read'),
    projectController.getProjectById
);



router.patch(
    '/:id',
    authenticate,
    authorize('projects.update'),
    // updateProjectValidation,
    validateRequest,
    projectController.updateProject
);



router.delete(
    '/:id',
    authenticate,
    authorize('projects.delete'),
    projectController.deleteProject
);


router.patch(
    '/:id/assign-members',
    authenticate,
    authorize('projects.assign'),
    // assignMembersValidation,
    validateRequest,
    projectController.assignTeamMembers
);



router.patch(
    '/:id/remove-member',
    authenticate,
    authorize('projects.assign'),
    // removeMemberValidation,
    validateRequest,
    projectController.removeTeamMember
);



router.patch(
    '/:id/change-manager',
    authenticate,
    authorize('projects.assign'),
    // changeProjectManagerValidation,
    validateRequest,
    projectController.changeProjectManager
);

module.exports = router;