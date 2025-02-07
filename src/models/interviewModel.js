import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";

const interviewModel = {
  interview_id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  int_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  int_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  int_datetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  int_result: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isactive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
};

let interview = null;
const initinterviewModel = async () => {
  try {
    if (interview) return interview;
    const sequelize = await getConnection();
    interview = sequelize.define("interview", interviewModel, {
      freezeTableName: true,
    });

    await interview.sync({ alter: true });
    return interview;
  } catch (err) {
    console.log("interview model", err.message);
  }
};

export default initinterviewModel;
