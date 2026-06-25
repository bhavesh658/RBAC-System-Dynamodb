const permissionRepository = require('./permission.repository');
const getPagination = require('../../common/pagination');


const getAllPermissions = async (options = {}) => {
const { limit, skip } = getPagination(options);
  return permissionRepository.getAllPermissions()
    
};

module.exports = {
    getAllPermissions,
};