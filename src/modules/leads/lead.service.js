const { v4: uuidv4 } = require("uuid");

const leadRepository = require("./lead.repository");
const userRepository = require("../users/user.repository");
const departmentRepository = require("../departments/department.repository");

const getPagination = require('../../common/pagination');
const AppError = require('../../common/AppError');
const HTTP_STATUS = require('../../constants/httpStatus');
const { createActivityLog } = require('../activity-logs/activityLog.service');


const createLead = async (payload, currentUser) => {

  if (payload.assignedTo) {
    const user = await userRepository.findById(payload.assignedTo);

    if (!user) {
      throw new AppError(
        "Assigned user not found",
        HTTP_STATUS.NOT_FOUND
      );
    }
  }

  if (payload.departmentId) {

    const department = await departmentRepository.findById(payload.departmentId);

    if (!department) {
      throw new AppError(
        "Department not found",
        HTTP_STATUS.NOT_FOUND
      );
    }
  }

  const lead = {
    leadId: uuidv4(),
    firstName: payload.firstName,
    lastName: payload.lastName || "",
    email: payload.email || null,
    phone: payload.phone,
    company: payload.company || "",
    source: payload.source || "Website",
    status: payload.status || "New",
    priority: payload.priority || "Medium",
    assignedTo: payload.assignedTo || null,
    departmentId: payload.departmentId || null,
    estimatedValue: payload.estimatedValue || 0,
    notes: payload.notes || "",
    followUpDate: payload.followUpDate || null,
    tags: payload.tags || [],
    isDeleted: false,
    isActive: true,
    createdBy: currentUser.userId,
    updatedBy: currentUser.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await leadRepository.createLead(
    lead
  );

  await createActivityLog({
    module: "Lead",
    action: "Create",
    description:
      `Lead ${lead.firstName} ${lead.lastName} created by ${currentUser.firstName} ${currentUser.lastName}`,
    performedBy: currentUser.userId,
    recordId: lead.leadId,
  });

  return lead;
};

const getAllLeads = async (query = {}) => {
  let leads = [];
  if (query.assignedTo) {
    leads = await leadRepository.findByAssignedTo(query.assignedTo);
  } else if (
    query.departmentId
  ) {
    leads = await leadRepository.findByDepartment(query.departmentId);
  } else if (query.status) {
    leads = await leadRepository.findByStatus(query.status);
  } else {
    leads = await leadRepository.getAllLeads();
  }

  leads = leads.filter((lead) => !lead.isDeleted);

  if (query.priority) {
    leads = leads.filter(
      (lead) => lead.priority === query.priority);
  }

  return leads;
};

const getLeadById = async (leadId) => {

  const lead = await leadRepository.findById(leadId);

  if (!lead || lead.isDeleted) {
    throw new AppError(
      "Lead not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  if (lead.assignedTo) {

    lead.assignedToData = await userRepository.findById(lead.assignedTo);
  }

  if (lead.departmentId) {

    lead.departmentData = await departmentRepository.findById(lead.departmentId);
  }
  if (lead.createdBy) {

    lead.createdByData = await userRepository.findById(lead.createdBy);
  }

  if (lead.updatedBy) {

    lead.updatedByData = await userRepository.findById(lead.updatedBy);
  }

  return lead;
};

const updateLead = async (leadId, payload, currentUser) => {

  const lead = await leadRepository.findById(leadId);

  if (!lead || lead.isDeleted) {
    throw new AppError(
      "Lead not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const updatedLead = await leadRepository.updateLead(leadId,
    {
      ...payload,
      updatedBy: currentUser.userId,
      updatedAt: new Date().toISOString(),
    }
  );

  await createActivityLog({
    module: "Lead",
    action: "Update",
    description:
      `Lead ${lead.firstName} ${lead.lastName} updated by ${currentUser.firstName} ${currentUser.lastName}`,
    performedBy: currentUser.userId,
    recordId: lead.leadId,
  });

  return updatedLead;
};

const deleteLead = async (leadId, currentUser) => {

  const lead = await leadRepository.findById(leadId);

  if (!lead || lead.isDeleted
  ) {
    throw new AppError(
      "Lead not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  await leadRepository.updateLead(leadId,
    {
      isDeleted: true,
      updatedBy:
        currentUser.userId,
      updatedAt:
        new Date().toISOString(),
    }
  );

  await createActivityLog({
    module: "Lead",
    action: "Delete",
    description:
      `Lead ${lead.firstName} ${lead.lastName} deleted by ${currentUser.firstName} ${currentUser.lastName}`,
    performedBy: currentUser.userId,
    recordId: lead.leadId,
  });

  return true;
};

const assignLead = async (leadId, assignedTo, currentUser) => {

  const lead = await leadRepository.findById(leadId);

  if (!lead || lead.isDeleted) {
    throw new AppError(
      "Lead not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const user = await userRepository.findById(assignedTo);

  if (!user) {
    throw new AppError(
      "Assigned user not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const updatedLead = await leadRepository.updateLead(leadId,
    {
      assignedTo,
      updatedBy: currentUser.userId,
      updatedAt: new Date().toISOString(),
    }
  );

  await createActivityLog({
    module: "Lead",
    action: "Assign",
    description:
      `Lead assigned to ${user.firstName} ${user.lastName}`,
    performedBy: currentUser.userId,
    recordId: lead.leadId,
  });

  return updatedLead;
};

const updateLeadStatus = async (leadId, status, currentUser) => {

  const lead = await leadRepository.findById(leadId);

  if (!lead || lead.isDeleted) {
    throw new AppError(
      "Lead not found",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const updatedLead = await leadRepository.updateLead(leadId,
    {
      status,
      updatedBy: currentUser.userId,
      updatedAt: new Date().toISOString(),
    }
  );

  await createActivityLog({
    module: "Lead",
    action: "Status Change",
    description:
      `Lead status changed to ${status}`,
    performedBy:
      currentUser.userId,
    recordId:
      lead.leadId,
  });

  return updatedLead;
};

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  updateLeadStatus,
};