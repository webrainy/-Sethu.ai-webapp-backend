import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";
import initbatchModel from "./batchModel.js";

let batchExam = null;
const initBatchExamModel = async () => {
  try {
    if (batchExam) return batchExam;
    const sequelize = await getConnection();
    batchExam = sequelize.define(
      "batch_exam",
      {
        exam_id: {
          primaryKey: true,
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        exam_datetime: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        isactive: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
        },
      },
      { freezeTableName: true },
    );

    const batch = await initbatchModel();
    batch.hasMany(batchExam, {
      as: "batchExamInfo",
      onDelete: "cascade",
      foreignKey: { allowNull: false, name: "batch_id" },
      targetKey: "batch_id",
    });
    batchExam.belongsTo(batch, {
      as: "batchInfo",
      foreignKey: { name: "batch_id" },
      targetKey: "batch_id",
    });

    await batchExam.sync({ alter: true });
    return batchExam;
  } catch (err) {
    console.log("batch exam model error:", err.message);
  }
};

export default initBatchExamModel;
