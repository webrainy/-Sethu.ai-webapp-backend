import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";

const batchModel = {
  batch_id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  technologies: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tutor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lab_coordinator: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  planned_hour: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  actual_hour: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isactive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
};

let batch = null;
const initbatchModel = async () => {
  try {
    if (batch) return batch;
    const sequelize = await getConnection();
    batch = sequelize.define("batch", batchModel, {
      freezeTableName: true,
    });

    await batch.sync({ alter: true });
    return batch;
  } catch (err) {
    console.log("batch model", err.message);
  }
};

export default initbatchModel;
