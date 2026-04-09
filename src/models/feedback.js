import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";
import initbatchModel from "./batchModel.js";

let feedback = null;

const initFeedbackModel = async () => {
  try {
    if (feedback) return feedback;

    const sequelize = await getConnection();

    feedback = await sequelize.define(
      "feedback",
      {
        feedback_id: {
          primaryKey: true,
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        feedback_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        isactive: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
      },
    );

    const bacth = await initbatchModel();
    bacth.hasMany(feedback, {
      as: "feedbackInfo",
      onDelete: "cascade",
      foreignKey: { allowNull: false, name: "batch_id" },
    });
    feedback.belongsTo(bacth, {
      as: "batchInfo",
      foreignKey: { name: "batch_id" },
      targetKey: "batch_id",
    });
    await feedback.sync({ alter: true });
    return feedback;
  } catch (error) {
    console.log("Feedback Model:", error);
  }
};
export default initFeedbackModel;
