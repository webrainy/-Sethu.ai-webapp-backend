import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";
import initBatchExamModel from "./batchExamModel.js"; // ← FIXED
import initstudentmodel from "./studentModel.js";

let examResult = null;
const initexamResultModel = async () => {
  try {
    if (examResult) return examResult;
    const sequelize = await getConnection();
    examResult = sequelize.define(
      "exam_result",
      {
        result_id: {
          primaryKey: true,
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
        },
        marks: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        total_marks: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        comments: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        isactive: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
        },
      },
      { freezeTableName: true },
    );

    const exam = await initBatchExamModel(); // ← FIXED
    const student = await initstudentmodel();

    exam.hasMany(examResult, {
      as: "examResults",
      onDelete: "cascade",
      foreignKey: { allowNull: false, name: "exam_id" },
      targetKey: "exam_id",
    });
    examResult.belongsTo(exam, {
      as: "examInfo",
      foreignKey: { name: "exam_id" },
      targetKey: "exam_id",
    });

    student.hasMany(examResult, {
      as: "studentExamResults",
      onDelete: "cascade",
      foreignKey: { allowNull: false, name: "student_id" },
      targetKey: "student_id",
    });
    examResult.belongsTo(student, {
      as: "studentInfo",
      foreignKey: { name: "student_id" },
      targetKey: "student_id",
    });

    await examResult.sync({ alter: true });
    return examResult;
  } catch (err) {
    console.log("exam result model error:", err.message);
  }
};

export default initexamResultModel;
