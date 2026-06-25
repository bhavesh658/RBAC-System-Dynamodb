const { v4: uuidv4 } = require("uuid");
const projectRepository = require("./project.repository");
const userRepository = require("../users/user.repository");
const AppError = require('../../common/AppError');
const HTTP_STATUS = require('../../constants/httpStatus');
const { createActivityLog, } = require('../activity-logs/activityLog.service');


const createProject = async (payload, currentUser) => {

    if (payload.projectManager) {

        const manager = await userRepository.findById(payload.projectManager);

        if (!manager) {
            throw new AppError(
                "Project manager not found",
                HTTP_STATUS.NOT_FOUND
            );
        }
    }

    const project = {
        projectId: uuidv4(),
        name: payload.name,
        description: payload.description || "",
        status: payload.status || "Planning",
        priority: payload.priority || "Medium",
        startDate: payload.startDate || null,
        endDate: payload.endDate || null,
        projectManager: payload.projectManager || null,
        teamMembers: payload.teamMembers || [],
        isDeleted: false,
        isActive: true,
        createdBy: currentUser.userId,
        updatedBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await projectRepository.createProject(
        project
    );

    await createActivityLog({
        module: "Project",
        action: "Create",
        description:
            `Project ${project.name} created by ${currentUser.firstName} ${currentUser.lastName}`,
        performedBy:
            currentUser.userId,
        recordId:
            project.projectId,
    });

    return project;
};


const getAllProjects = async (query = {}) => {
    let projects = [];
    if (query.projectManager) {
        projects = await projectRepository.findByManager(query.projectManager);

    } else if (query.status) {
        projects = await projectRepository.findByStatus(query.status);

    } else {
        projects = await projectRepository.getAllProjects();
    }
    projects = projects.filter(
        (project) => !project.isDeleted
    );
    if (query.priority) {
        projects = projects.filter(
            (project) =>
                project.priority === query.priority
        );
    }

    return projects;
};


const getProjectById = async (projectId) => {

    const project = await projectRepository.findById(projectId);

    if (!project || project.isDeleted) {
        throw new AppError(
            "Project not found",
            HTTP_STATUS.NOT_FOUND
        );
    }

    if (project.projectManager) {
        const manager = await userRepository.findById(project.projectManager);
        project.projectManagerData = {
            userId: manager.userId,
            firstName: manager.firstName,
            lastName: manager.lastName,
            email: manager.email,
            department: manager.department,
            role: manager.role,
            isActive: manager.isActive,
        };
    }

    return project;
};


const updateProject = async (projectId, payload, currentUser) => {

    const project = await projectRepository.findById(projectId);

    if (!project || project.isDeleted
    ) {
        throw new AppError(
            "Project not found",
            HTTP_STATUS.NOT_FOUND
        );
    }

    const updatedProject = await projectRepository.updateProject(projectId,
        {
            ...payload,
            updatedBy:
                currentUser.userId,
            updatedAt:
                new Date().toISOString(),
        }
    );

    await createActivityLog({
        module: "Project",
        action: "Update",
        description:
            `Project ${updatedProject.name} updated by ${currentUser.firstName} ${currentUser.lastName}`,
        performedBy: currentUser.userId,
        recordId: updatedProject.projectId,
    });

    return updatedProject;
};


const deleteProject = async (projectId, currentUser) => {

    const project =
        await projectRepository.findById(projectId);

    if (!project || project.isDeleted) {
        throw new AppError(
            "Project not found",
            HTTP_STATUS.NOT_FOUND
        );
    }

    await projectRepository.updateProject(projectId,
        {
            isDeleted: true,
            updatedBy:
                currentUser.userId,

            updatedAt:
                new Date().toISOString(),
        }
    );

    return true;
};

const assignTeamMembers = async (projectId, teamMembers, currentUser) => {

    const project =
        await projectRepository.findById(projectId);

    if (!project || project.isDeleted) {
        throw new AppError(
            "Project not found",
            HTTP_STATUS.NOT_FOUND
        );
    }

    for (const userId of teamMembers) {

        const user = await userRepository.findById(userId);

        if (!user) {
            throw new AppError(
                `User ${userId} not found`,
                HTTP_STATUS.NOT_FOUND
            );
        }
    }

    const uniqueMembers = [
        ...new Set([
            ...(project.teamMembers || []),
            ...teamMembers,
        ]),
    ];

    const updatedProject = await projectRepository.updateProject(
        projectId,
        {
            teamMembers:
                uniqueMembers,

            updatedBy:
                currentUser.userId,

            updatedAt:
                new Date().toISOString(),
        }
    );

    await createActivityLog({
        module: "Project",
        action: "Assign Members",
        description:
            `${currentUser.firstName} ${currentUser.lastName} assigned members to ${project.name}`,
        performedBy: currentUser.userId,
        recordId: project.projectId,
    });

    return updatedProject;
};

const removeTeamMember = async (projectId, userId, currentUser) => {

    const project = await projectRepository.findById(projectId);

    if (!project || project.isDeleted) {
        throw new AppError(
            "Project not found",
            HTTP_STATUS.NOT_FOUND
        );
    }

    const updatedMembers =
        (project.teamMembers || [])
            .filter(
                (memberId) =>
                    memberId !== userId
            );

    const updatedProject =
        await projectRepository.updateProject(
            projectId,
            {
                teamMembers: updatedMembers,
                updatedBy: currentUser.userId,
                updatedAt: new Date().toISOString(),
            }
        );

    await createActivityLog({
        module: "Project",
        action: "Remove Member",
        description:
            `${currentUser.firstName} ${currentUser.lastName} removed a member from ${project.name}`,
        performedBy: currentUser.userId,
        recordId: project.projectId,
    });

    return updatedProject;
};

const changeProjectManager = async (projectId, projectManager, currentUser) => {

    const project =
        await projectRepository.findById(projectId);

    if (!project || project.isDeleted
    ) {
        throw new AppError(
            "Project not found",
            HTTP_STATUS.NOT_FOUND
        );
    }

    const manager =
        await userRepository.findById(projectManager);

    if (!manager) {
        throw new AppError(
            "Project manager not found",
            HTTP_STATUS.NOT_FOUND
        );
    }

    const teamMembers = [
        ...(project.teamMembers || []),
    ];
    if (!teamMembers.includes(projectManager)) {
        teamMembers.push(projectManager);
    }

    const updatedProject =
        await projectRepository.updateProject(
            projectId,
            {
                projectManager,
                teamMembers,
                updatedBy: currentUser.userId,
                updatedAt: new Date().toISOString(),
            }
        );

    await createActivityLog({
        module: "Project",
        action: "Change Manager",
        description:
            `${currentUser.firstName} ${currentUser.lastName} changed manager of ${project.name}`,
        performedBy: currentUser.userId,
        recordId: project.projectId,
    });

    return updatedProject;
};


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