const roleRepository = require('./role.repository');
const { v4: uuidv4 } = require('uuid');
const permissionRepository = require('../permissions/permission.repository');
const AppError = require('../../common/AppError');
const HTTP_STATUS = require('../../constants/httpStatus');
const pagination = require('../../common/pagination');
const { createActivityLog } = require('../activity-logs/activityLog.service')

const createRole = async (data, user) => {
  const existing =
    await roleRepository.findByNameAndDepartment(
      data.name,
      data.department
    );
  if (existing) {
    throw new AppError(
      'Role already exists in this department',
      HTTP_STATUS.CONFLICT
    );
  }

  const role = {
    roleId: uuidv4(),
    name: data.name,
    description: data.description || "",
    department: data.department,
    permissions: data.permissions || [],
    isSystemRole: false,
    isActive: true,
    createdBy: user.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await roleRepository.createRole(role);

  // await createActivityLog({
  //   module: 'Role',
  //   action: 'Create',
  //   description: `${user.firstName} ${user.lastName} created role ${role.name}`,
  //   recordId: role._id,
  //   metadata: {
  //     newvalue: {
  //       name: role.name,
  //       department: role.department,
  //     }
  //   },
  //   performedBy: user._id,
  // });

  return role;
};

const getRolesByDepartment = async (departmentId, options = {}) => {
  const { limit, skip } = pagination(options);

  const roles =
    await roleRepository.getAllRoles();

  return roles
    .filter(
      (role) =>
        role.department === departmentId
    )
    .slice(skip, skip + limit);
};

const assignPermissions = async (
  roleId,
  permissionIds,
  user
) => {

  const role =
    await roleRepository.findById(
      roleId
    );

  if (!role) {
    throw new AppError(
      "Role not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const existingPermissions =
    role.permissions || [];

  const mergedPermissions =
    [
      ...new Set([
        ...existingPermissions,
        ...permissionIds,
      ]),
    ];

  const updatedRole =
    await roleRepository.updatePermissions(
      roleId,
      mergedPermissions
    );

  return updatedRole;
};

const removePermissions = async (
  roleId,
  permissionIds,
  user
) => {
  const role =
    await roleRepository.findById(
      roleId
    );

  if (!role) {
    throw new AppError(
      "Role not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const existingPermissions =
    role.permissions || [];

  const invalidPermissions =
    permissionIds.filter(
      (id) =>
        !existingPermissions.includes(id)
    );

  if (invalidPermissions.length > 0) {
    throw new AppError(
      `Invalid permission ids: ${invalidPermissions.join(", ")}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const updatedPermissions =
    existingPermissions.filter(
      (permissionId) =>
        !permissionIds.includes(
          permissionId
        )
    );

  const updatedRole =
    await roleRepository.updatePermissions(
      roleId,
      updatedPermissions
    );

  return updatedRole;
};

const getAllRoles = async (query = {}) => {

  const filter = {};

  if (query.department) {
    filter.department = query.department;
  }


  const { limit, skip } = pagination(query);

  const roles =
    await roleRepository.getAllRoles();

  return roles
    .filter((role) =>
      query.department
        ? role.department === query.department
        : true
    )
    .sort((a, b) =>
      a.name.localeCompare(b.name)
    )
    .slice(skip, skip + limit);
};

const updateRole = async (
  roleId,
  data,
  user
) => {

  const existingRole =
    await roleRepository.findById(roleId);

  if (!existingRole) {
    throw new AppError(
      "Role not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const updatedRole =
    await roleRepository.updateRole(
      roleId,
      {
        ...data,
        updatedAt:
          new Date().toISOString(),
      }
    );

  // await createActivityLog({
  //   module: 'Role',
  //   action: 'Update',
  //   description: `${user.firstName} ${user.lastName} updated role "${role.name}"`,
  //   recordId: role._id,
  //   performedBy: user._id,
  //   metadata: {
  //     oldvalue: {
  //       name: oldRoleData.name,
  //       department: oldRoleData.department,
  //     },
  //     newvalue: {
  //       name: data.name || role.name,
  //       department: data.department || role.department,
  //     }
  //   }
  // });

  return updatedRole;
};

module.exports = {
  createRole,
  getRolesByDepartment,
  assignPermissions,
  updateRole,
  getAllRoles,
  removePermissions,
};