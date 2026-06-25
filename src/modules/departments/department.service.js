const { v4: uuidv4 } = require("uuid");
const departmentRepository = require("./department.repository");
const userRepository = require("../users/user.repository");
const AppError = require('../../common/AppError');
const HTTP_STATUS = require('../../constants/httpStatus');
const pagination = require('../../common/pagination');
const { createActivityLog } = require('../activity-logs/activityLog.service');


const createDepartment = async (data, user) => {
  const existing = await departmentRepository.findByCode(
    data.code.toUpperCase(),
  );

  if (existing) {
    throw new AppError('Department already exists', HTTP_STATUS.CONFLICT);
  }


  const department = {
    departmentId: uuidv4(),
    name: data.name,
    code: data.code.toUpperCase(),
    description: data.description || "",
    head: data.head || null,
    isActive: true,
    createdBy: user.userId,
    createdAt:
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString(),
  };


  await departmentRepository.createDepartment(department);

  await createActivityLog({
    module: 'Department',
    action: 'Create',
    description: `Department ${department.name} created by ${user.firstName} ${user.lastName}`,
    performedBy: user.userId,
    recordId: department.departmentId,
  });


  return department;
};



const getAllDepartments = async (options = {}) => {
  const { limit, skip } = pagination(options);
  return await departmentRepository.getAllDepartments()

};



const getDepartmentById = async (departmentId) => {
  const department = await departmentRepository.findById(departmentId);

  if (!department) {
    throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
  }

  return department;
};




const updateDepartment = async (id, data, user) => {
  const dept = await departmentRepository.findById(id);

  if (!dept) {
    throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
  }

  const updates = {
    ...data,
    updatedBy: user.userId,
    updatedAt: new Date().toISOString(),
  };

  if (updates.code) {
    updates.code = updates.code.toUpperCase();
  }

  const updatedDepartment = await departmentRepository.updateDepartment(id, updates);

  await createActivityLog({
    module: 'Department',
    action: 'Update',
    description: `Department ${dept.name} updated by ${user.firstName} ${user.lastName}`,
    performedBy: user.userId,
    recordId: updatedDepartment.departmentId,
  });

  return updatedDepartment;
};



const assignHead = async (deptId, userId, currentUser) => {

  // Check if the department exists
  const department = await departmentRepository.findById(deptId);
  if (!department) {
    throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
  }

  // Check if the user exists
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  // Assign the user as the head of the department

  const updatedDepartment = await departmentRepository.updateDepartment(deptId,
    {
      head: userId,
      updatedBy: userId,
      updatedAt: new Date().toISOString()
    });

  await createActivityLog({
    module: 'Department',
    action: 'Assign Head',
    description: `Department head assigned to ${user.firstName} ${user.lastName} for department ${department.name} by ${currentUser.firstName} ${currentUser.lastName}`,
    performedBy: currentUser.userId,
    recordId: department.departmentId,
  });

  return updateDepartment;
};


module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  assignHead,
};