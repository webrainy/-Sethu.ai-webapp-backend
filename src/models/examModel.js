import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";

const examModel = {
  exam_id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  exam_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  exam_datetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  exam_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  exam_result: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  exam_marks: {
    type: DataTypes.INTEGER,
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

    await exam.sync({ alter: true });
    return exam;
  } catch (err) {
    console.log("exam model", err.message);
  }
};

export default initexamModel;
