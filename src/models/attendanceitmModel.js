import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";

import initattendanceModel from "./attendanceModel.js";
import initstudentmodel from "./studentModel.js";

const attendanceItmModel = {
  att_id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  attendance_status: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isactive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
};

let attendanceItm = null;
const initattendanceItm = async () => {
  try {
    if (attendanceItm) return attendanceItm;
    const sequelize = await getConnection();
    attendanceItm = sequelize.define("attendanceitem", attendanceItmModel, {
      freezeTableName: true,
    });

    const student = await initstudentmodel();
    const attendance = await initattendanceModel();

    attendanceItm.belongsTo(student, {
      as: "studentInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        name: "student_id",
      },
      targetKey: "student_id",
    });

    student.hasMany(attendanceItm, {
      as: "studentInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        name: "student_id",
      },
      targetKey: "student_id",
    });

    attendanceItm.belongsTo(attendance, {
      as: "attendanceInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        name: "attendance_id",
      },
      targetKey: "attendance_id",
    });

    attendance.hasMany(attendanceItm, {
      as: "attendanceInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        name: "attendance_id",
      },
      targetKey: "attendance_id",
    });

    await attendanceItm.sync({ alter: true });
    return attendanceItm;
  } catch (err) {
    console.log("attendance Item Model :", err.message);
  }
};

export default initattendanceItm;
