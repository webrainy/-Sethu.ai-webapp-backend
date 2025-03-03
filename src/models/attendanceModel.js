import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";
import initbatchModel from "./batchModel.js";
import initaccountModel from "./accountModel.js";

const attendanceModel = {
  attendance_id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  attendance_type: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isactive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
};

let attendance = null;
const initAttendanceModel = async () => {
  try {
    if (attendance) return attendance;
    const sequelize = await getConnection();
    attendance = sequelize.define("attendance", attendanceModel, {
      freezeTableName: true,
    });

    const batch = await initbatchModel();
    // const student = await initstudentmodel();

    attendance.belongsTo(batch, {
      as: "batchInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
        name: "batch_id",
      },
      targetKey: "batch_id",
    });

    const user = await initaccountModel();
    attendance.belongsTo(user, {
      as: "createdBy",
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
        name: "account_id",
      },
      targetKey: "account_id",
    });

    await attendance.sync({ alter: true });
    return attendance;
  } catch (err) {
    console.log("attendance model", err.message);
  }
};

export default initAttendanceModel;
