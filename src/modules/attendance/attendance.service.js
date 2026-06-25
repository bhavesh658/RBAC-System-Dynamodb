const AppError = require('../../common/AppError');
const HTTP_STATUS = require('../../constants/httpStatus');
const attendanceRepository =require("./attendance.repository");
const { v4: uuidv4 } = require("uuid");

const punchIn = async (userId) => {
  const today =new Date().toISOString() .split("T")[0];

  const existing =await attendanceRepository.findTodayAttendance( userId, today );

  if ( existing && existing.punchIn) {
    throw new AppError(
      "Already punched in for today",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const attendance = {
    attendanceId: uuidv4(),
    userId,
    date: today,
    punchIn:new Date().toISOString(),
    punchOut: null,
    totalHours: 0,
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString(),
  };

  return await attendanceRepository.createAttendance(
    attendance
  );
};


const punchOut = async (userId) => {
  const today =new Date().toISOString().split("T")[0];

  const attendance =await attendanceRepository.findTodayAttendance( userId,today);

  if (!attendance) {
    throw new AppError(
      "No active punch-in session found",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  if (attendance.punchOut) {
    throw new AppError(
      "Already punched out",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const punchOutTime =new Date();

  const diff =(punchOutTime -new Date(attendance.punchIn )) /(1000 * 60 * 60);

  return await attendanceRepository.updateAttendance(attendance.attendanceId,
    {
      punchOut:
        punchOutTime.toISOString(),
      totalHours:
        parseFloat(
          diff.toFixed(2)
        ),
      updatedAt:
        new Date().toISOString(),
    }
  );
};
module.exports = {
  punchIn,
  punchOut
};