import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";
import initFeedbackModel from "./feedback.js";
import initstudentmodel from "./studentModel.js";

let feedbackResult = null;
const initFeedbackResultModel = async () => {
  try {
    if (feedbackResult) return feedbackResult;
    const sequelize = await getConnection();
    feedbackResult = sequelize.define(
      "feedback_result",
      {
        result_id: {
          primaryKey: true,
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
        },
        feedback_type: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        feedback_star: {
          type: DataTypes.INTEGER,
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

    const feedbackModel = await initFeedbackModel();
    const student = await initstudentmodel();

    feedbackModel.hasMany(feedbackResult, {
      as: "feedbackResults",
      onDelete: "cascade",
      foreignKey: { allowNull: false, name: "feedback_id" },
      targetKey: "feedback_id",
    });
    feedbackResult.belongsTo(feedbackModel, {
      as: "feedbackInfo",
      foreignKey: { name: "feedback_id" },
      targetKey: "feedback_id",
    });

    student.hasMany(feedbackResult, {
      as: "studentFeedbackResults",
      onDelete: "cascade",
      foreignKey: { allowNull: false, name: "student_id" },
      targetKey: "student_id",
    });
    feedbackResult.belongsTo(student, {
      as: "studentInfo",
      foreignKey: { name: "student_id" },
      targetKey: "student_id",
    });

    await feedbackResult.sync({ alter: true });
    return feedbackResult;
  } catch (err) {
    console.log("feedback result model error:", err.message);
  }
};

export default initFeedbackResultModel;
