import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";
import initstudentmodel from "./studentModel.js";

const examModel = {
  exam_id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  exam_datetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  exam_result: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  exam_marks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isactive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
};

let exam = null;
const initexamModel = async () => {
  try {
    if (exam) return exam;
    const sequelize = await getConnection();
    exam = sequelize.define("exam", examModel, {
      freezeTableName: true,
    });

    const student = await initstudentmodel();
    student.hasMany(exam, {
      as: "examInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        name: "student_id",
      },
      targetKey: "student_id",
    });

    await exam.sync({ alter: true });
    return exam;
  } catch (err) {
    console.log("exam model", err.message);
  }
};

export default initexamModel;
