const AppError = require('../../common/AppError');
const HTTP_STATUS = require('../../constants/httpStatus');
const taskRepository = require('./task.repository');
const projectRepository = require('../projects/project.repository');
const userRepository = require('../users/user.repository');
const { createActivityLog, } = require('../activity-logs/activityLog.service');
const { v4: uuidv4 } = require("uuid");

const createTask = async (
  payload,
  currentUser
) => {

  const project =
    await projectRepository.findById(
      payload.projectId
    );

  if (!project || project.isDeleted) {
    throw new AppError(
      "Project not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  if (payload.assignedTo) {

    const assignedUser =
      await userRepository.findById(
        payload.assignedTo
      );

    if (!assignedUser) {
      throw new AppError(
        "Assigned user not found",
        HTTP_STATUS.NOT_FOUND
      );
    }
  }

  const task = {
    taskId: uuidv4(),

    title: payload.title,
    description:
      payload.description || "",

    projectId:
      payload.projectId,

    assignedTo:
      payload.assignedTo || null,

    status:
      payload.status || "Todo",

    priority:
      payload.priority || "Medium",

    startDate:
      payload.startDate || null,

    dueDate:
      payload.dueDate || null,

    isDeleted: false,
    isActive: true,

    createdBy:
      currentUser.userId,

    updatedBy: null,

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),
  };

  await taskRepository.createTask(
    task
  );

  await createActivityLog({
    module: "Task",
    action: "Create",
    description:
      `Task ${task.title} created by ${currentUser.firstName} ${currentUser.lastName}`,
    performedBy:
      currentUser.userId,
    recordId:
      task.taskId,
  });

  return task;
};


const getAllTasks = async (query = {}) => {

  let tasks = [];

  if (query.assignedTo) {

    tasks = await taskRepository.findByAssignedTo(query.assignedTo);

  } else if (query.projectId) {
    tasks = await taskRepository.findByProjectId(query.projectId);

  } else if (query.status) {

    tasks = await taskRepository.findByStatus(query.status);

  } else {

    tasks = await taskRepository.getAllTasks();
  }

  tasks = tasks.filter(
    (task) => !task.isDeleted
  );

  if (query.priority) {

    tasks = tasks.filter(
      (task) =>
        task.priority ===
        query.priority
    );
  }

  return tasks;
};



const getTaskById = async (taskId) => {

  const task = await taskRepository.findById(taskId);
  if (!task || task.isDeleted) {
    throw new AppError(
      "Task not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  if (task.projectId) {

    task.projectData =
      await projectRepository.findById(
        task.projectId
      );
  }

  if (task.assignedTo) {

    task.assignedToData = await userRepository.findById(task.assignedTo);

  }

  return task;
};



const updateTask = async (
  taskId,
  payload,
  currentUser
) => {

  const task =
    await taskRepository.findById(
      taskId
    );

  if (
    !task ||
    task.isDeleted
  ) {
    throw new AppError(
      "Task not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const updatedTask =
    await taskRepository.updateTask(
      taskId,
      {
        ...payload,
        updatedBy:
          currentUser.userId,
        updatedAt:
          new Date().toISOString(),
      }
    );

  await createActivityLog({
    module: "Task",
    action: "Update",
    description:
      `Task ${updatedTask.title} updated by ${currentUser.firstName} ${currentUser.lastName}`,
    performedBy:
      currentUser.userId,
    recordId:
      updatedTask.taskId,
  });

  return updatedTask;
};



const deleteTask = async (
  taskId,
  currentUser
) => {

  const task =
    await taskRepository.findById(
      taskId
    );

  if (
    !task ||
    task.isDeleted
  ) {
    throw new AppError(
      "Task not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  await taskRepository.updateTask(
    taskId,
    {
      isDeleted: true,
      updatedBy:
        currentUser.userId,
      updatedAt:
        new Date().toISOString(),
    }
  );

  await createActivityLog({
    module: "Task",
    action: "Delete",
    description:
      `Task ${task.title} deleted by ${currentUser.firstName} ${currentUser.lastName}`,
    performedBy:
      currentUser.userId,
    recordId:
      task.taskId,
  });

  return true;
};


const assignTask = async (
  taskId,
  assignedTo,
  currentUser
) => {

  const task =
    await taskRepository.findById(
      taskId
    );

  if (
    !task ||
    task.isDeleted
  ) {
    throw new AppError(
      "Task not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const user =
    await userRepository.findById(
      assignedTo
    );

  if (!user) {
    throw new AppError(
      "Assigned user not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const updatedTask =
    await taskRepository.updateTask(
      taskId,
      {
        assignedTo,
        updatedBy:
          currentUser.userId,
        updatedAt:
          new Date().toISOString(),
      }
    );

  await createActivityLog({
    module: "Task",
    action: "Assign",
    description:
      `Task ${task.title} assigned to ${user.firstName} ${user.lastName}`,
    performedBy:
      currentUser.userId,
    recordId:
      task.taskId,
  });

  return updatedTask;
};


const changeTaskStatus = async (
  taskId,
  status,
  currentUser
) => {

  const task =
    await taskRepository.findById(
      taskId
    );

  if (
    !task ||
    task.isDeleted
  ) {
    throw new AppError(
      "Task not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const updatedTask =
    await taskRepository.updateTask(
      taskId,
      {
        status,
        updatedBy:
          currentUser.userId,
        updatedAt:
          new Date().toISOString(),
      }
    );

  await createActivityLog({
    module: "Task",
    action: "Status Change",
    description:
      `Task ${task.title} status changed to ${status}`,
    performedBy:
      currentUser.userId,
    recordId:
      task.taskId,
  });

  return updatedTask;
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  changeTaskStatus,
};