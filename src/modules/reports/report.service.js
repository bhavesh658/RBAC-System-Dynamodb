const attendanceRepository = require('../attendance/attendance.repository');
const userRepository = require('../users/user.repository');
const departmentRepository = require('../departments/department.repository');


const getDailyReport = async (
  date
) => {

  const attendances =
    await attendanceRepository.findByDate(
      date
    );

  const report = [];

  for (const attendance of attendances) {

    const user =
      await userRepository.findById(
        attendance.userId
      );

    report.push({
      ...attendance,
      userData: user
        ? sanitizeUser(user)
        : null,
    });
  }

  return report;
};

const getMonthlyReport = async (
  month,
  year
) => {

  const attendances =
    await attendanceRepository.getAllAttendances();

  return attendances.filter(
    (attendance) => {

      const date =
        new Date(attendance.date);

      return (
        date.getMonth() + 1 === month &&
        date.getFullYear() === year
      );
    }
  );
};

const getDepartmentReport = async (
  departmentId
) => {

  const users =
    await userRepository.getAllUsers();

  const departmentUsers =
    users.filter(
      (user) =>
        user.departmentId ===
        departmentId
    );

  const userIds =
    departmentUsers.map(
      (user) => user.userId
    );

  const attendances =
    await attendanceRepository.getAllAttendances();

  const report = [];

  for (const attendance of attendances) {

    if (
      userIds.includes(
        attendance.userId
      )
    ) {

      const user =
        departmentUsers.find(
          (u) =>
            u.userId ===
            attendance.userId
        );

      report.push({
        ...attendance,
        userData: user
          ? sanitizeUser(user)
          : null,
      });
    }
  }

  return report;
};

module.exports = {
  getDailyReport,
  getMonthlyReport,
  getDepartmentReport,
};