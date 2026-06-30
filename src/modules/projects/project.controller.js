const asyncHandler = require('../../common/asyncHandler');
const sendResponse = require('../../common/apiResponse');
const HTTP_STATUS = require('../../constants/httpStatus');
const projectService = require('./project.service');


const createProject = asyncHandler(
    async (req, res) => {
        const project =
            await projectService.createProject(
                req.body,
                req.user
            );

        return sendResponse(
            res,
            HTTP_STATUS.CREATED,
            'Project created successfully',
            project
        );
    }
);



const getAllProjects = asyncHandler(
    async (req, res) => {
        const projects =
            await projectService.getAllProjects(
                req.query
            );

        return sendResponse(
            res,
            HTTP_STATUS.OK,
            'Projects fetched successfully',
            projects
        );
    }
);



const getProjectById = asyncHandler(
    async (req, res) => {
        const project =
            await projectService.getProjectById(
                req.params.id
            );

        return sendResponse(
            res,
            HTTP_STATUS.OK,
            'Project fetched successfully',
            project
        );
    }
);



const updateProject = asyncHandler(
    async (req, res) => {
        const project =
            await projectService.updateProject(
                req.params.id,
                req.body,
                req.user
            );

        return sendResponse(
            res,
            HTTP_STATUS.OK,
            'Project updated successfully',
            project
        );
    }
);


const deleteProject = asyncHandler(
    async (req, res) => {
        await projectService.deleteProject(
            req.params.id,
            req.user
        );

        return sendResponse(
            res,
            HTTP_STATUS.OK,
            'Project deleted successfully',
            null
        );
    }
);

const assignTeamMembers = asyncHandler(
    async (req, res) => {

        const project =
            await projectService.assignTeamMembers(
                req.params.id,

                req.body.teamMembers,

                req.user
            );

        return sendResponse(
            res,
            HTTP_STATUS.OK,
            'Team members assigned successfully',
            project
        );
    }
);

const removeTeamMember = asyncHandler(
    async (req, res) => {

        const project =
            await projectService.removeTeamMember(
                req.params.id,

                req.body.userId,

                req.user
            );

        return sendResponse(
            res,
            HTTP_STATUS.OK,
            'Team member removed successfully',
            project
        );
    }
);


const changeProjectManager = asyncHandler(
    async (req, res) => {

        const project =
            await projectService.changeProjectManager(
                req.params.id,

                req.body.projectManager,

                req.user
            );

        return sendResponse(
            res,
            HTTP_STATUS.OK,
            'Project manager changed successfully',
            project
        );
    }
);



module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    assignTeamMembers,
    removeTeamMember,
    changeProjectManager
};