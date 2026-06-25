require("dotenv").config();

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient } = require("../config/dynamodb");

const PERMISSION_TABLE = "Permissions";
const DEPARTMENT_TABLE = "Departments";
const ROLE_TABLE = "Roles";
const USER_TABLE = "Users";

const permissionData = [
  {
    name: "permissions.read",
    module: "permissions",
    action: "read",
    description: "View all permissions",
    isSystemPermission: true,
  },
  {
    name: "departments.create",
    module: "departments",
    action: "create",
    description: "Create departments",
    isSystemPermission: true,
  },
  {
    name: "departments.read",
    module: "departments",
    action: "read",
    description: "View departments",
    isSystemPermission: true,
  },
  {
    name: "departments.update",
    module: "departments",
    action: "update",
    description: "Update departments",
    isSystemPermission: true,
  },
  {
    name: "roles.create",
    module: "roles",
    action: "create",
    description: "Create roles",
    isSystemPermission: true,
  },
  {
    name: "roles.read",
    module: "roles",
    action: "read",
    description: "View roles",
    isSystemPermission: true,
  },
  {
    name: "roles.update",
    module: "roles",
    action: "update",
    description: "Update roles",
    isSystemPermission: true,
  },
  {
    name: "roles.assignpermissions",
    module: "roles",
    action: "assignpermissions",
    description: "Assign permissions to roles",
    isSystemPermission: true,
  },
  {
    name: "users.create",
    module: "users",
    action: "create",
    description: "Create users",
    isSystemPermission: true,
  },
  {
    name: "users.read",
    module: "users",
    action: "read",
    description: "View users",
    isSystemPermission: true,
  },
  {
    name: "users.update",
    module: "users",
    action: "update",
    description: "Update users",
    isSystemPermission: true,
  },
  {
    name: "projects.create",
    module: "projects",
    action: "create",
    description: "Create projects",
    isSystemPermission: true,
  },
  {
    name: "projects.read",
    module: "projects",
    action: "read",
    description: "View projects",
    isSystemPermission: true,
  },
  {
    name: "projects.update",
    module: "projects",
    action: "update",
    description: "Update projects",
    isSystemPermission: true,
  },
  {
    name: "projects.delete",
    module: "projects",
    action: "delete",
    description: "Delete projects",
    isSystemPermission: true,
  },
  {
    name: "tasks.create",
    module: "tasks",
    action: "create",
    description: "Create tasks",
    isSystemPermission: true,
  },
  {
    name: "tasks.read",
    module: "tasks",
    action: "read",
    description: "View tasks",
    isSystemPermission: true,
  },
  {
    name: "tasks.update",
    module: "tasks",
    action: "update",
    description: "Update tasks",
    isSystemPermission: true,
  },
  {
    name: "tasks.delete",
    module: "tasks",
    action: "delete",
    description: "Delete tasks",
    isSystemPermission: true,
  },
  {
    name: "activitylogs.read",
    module: "activitylogs",
    action: "read",
    description: "View activity logs",
    isSystemPermission: true,
  },
];

const seedData = async () => {
  try {
    console.log("Seeding started...");

    // Permissions
    const permissionIds = [];

    for (const permission of permissionData) {
      const permissionId = uuidv4();

      permissionIds.push(permissionId);

      await docClient.send(
        new PutCommand({
          TableName: PERMISSION_TABLE,
          Item: {
            permissionId,
            ...permission,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        })
      );
    }

    console.log("Permissions seeded");

    // Department
    const departmentId = uuidv4();

    await docClient.send(
      new PutCommand({
        TableName: DEPARTMENT_TABLE,
        Item: {
          departmentId,
          name: "System",
          code: "SYSTEM",
          description: "Internal system department",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    );

    console.log("Department seeded");

    // Role
    const roleId = uuidv4();

    await docClient.send(
      new PutCommand({
        TableName: ROLE_TABLE,
        Item: {
          roleId,
          name: "Super Admin",
          description: "Full system access",
          department: departmentId,
          permissions: permissionIds,
          isSystemRole: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    );

    console.log("Role seeded");

    // Admin User
    const hashedPassword = await bcrypt.hash(
      process.env.SUPER_ADMIN_PASSWORD,
      10
    );

    const userId = uuidv4();

    await docClient.send(
      new PutCommand({
        TableName: USER_TABLE,
        Item: {
          userId,
          firstName: "Super",
          lastName: "Admin",
          email: process.env.SUPER_ADMIN_EMAIL.toLowerCase(),
          password: hashedPassword,
          department: departmentId,
          role: roleId,
          isActive: true,
          lastLoginAt: null,
          resetPasswordOtp: null,
          resetPasswordOtpExpires: null,
          refreshToken: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    );

    console.log("Super Admin seeded");
    console.log("Seed completed successfully");

    process.exit(0);
  } catch (error) {
    console.error("Seed Error:", error);
    process.exit(1);
  }
};

seedData();