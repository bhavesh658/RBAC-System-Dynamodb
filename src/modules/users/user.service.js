const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require("uuid");
const userRepository = require('./user.repository');
const AppError = require('../../common/AppError');
const HTTP_STATUS = require('../../constants/httpStatus');
const pagination = require('../../common/pagination');
const { createActivityLog } = require('../activity-logs/activityLog.service')

const createUser = async (data, createdBy) => {

  const email =
    data.email.trim().toLowerCase();

  const existing =
    await userRepository.findByEmail(
      email
    );

  if (existing) {
    throw new AppError(
      'User already exists with this email'
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      data.password,
      10
    );

  const user = {
    userId: uuidv4(),
    firstName: data.firstName,
    lastName: data.lastName || '',
    password:hashedPassword,
    email,
    phone: data.phone || '',
    department: data.department || null,
    role: data.role || null,
    isActive:true,
    createdBy: createdBy.userId,
    createdAt:
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString(),
  };

  await userRepository.createUser(user);

  await createActivityLog(
    {
      module: 'User',
      action: 'Create User',
      description: `User Created ${user.firstName} ${user.lastName}  by ${createdBy.firstName} ${createdBy.lastName}`,
      performedBy: createdBy.userId,
      recordId:user.userId
    }
  )

  return user;
};

const getUsers = async () => {
  return await userRepository.getUsers();
};

const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError(
      'User not found',
      HTTP_STATUS.NOT_FOUND
    );
  }

  return user;
};


const updateUser = async ( userId,data,updatedBy) => {

  const existingUser = await userRepository.findById(userId);

  if (!existingUser) {
    throw new AppError(
      'User not found',
      HTTP_STATUS.NOT_FOUND
    );
  }

  const updatedUser =
    await userRepository.updateUser(userId,
      {
        ...data,
        updatedAt:
          new Date().toISOString(),
        updatedBy:updatedBy.userId  
      }
    );

    
    await createActivityLog({
        module: 'User',
        action: 'Update User',
        description: `User ${updatedUser.firstName} ${updatedUser.lastName} is Updated By  ${updatedBy.firstName} ${updatedBy.lastName}`,
        performedBy: updatedBy.userId,
        recordId: updatedUser.userId,
    })

  return updatedUser;
};

const toggleUserStatus = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError(
      'User not found',
      HTTP_STATUS.NOT_FOUND
    );
  }
  return await userRepository.updateUser(userId, {
    isActive: !user.isActive,
    updatedAt: new Date().toISOString(),
  });
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
};