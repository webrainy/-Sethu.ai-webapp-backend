import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";
import initstudentmodel from "./studentModel.js";
import initbatchModel from "./batchModel.js";

const assignmentModel = {
  assignment_id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  isactive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
};

let assignment = null;
const initassignmentModel = async () => {
  try {
    if (assignment) return assignment;
    const sequelize = await getConnection();
    assignment = sequelize.define("assignment", assignmentModel, {
      freezeTableName: true,
    });

    const batch = await initbatchModel();
    // const student = await initstudentmodel();

    assignment.belongsTo(batch, {
      as: "batchAssignment",
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
        name: "batch_id",
      },
      targetKey: "batch_id",
    });

    // assignment.belongsTo(student, {
    //   as: "studentInfo",
    //   onDelete: "cascade",
    //   foreignKey: {
    //     allowNull: true,
    //     name: "student_id",
    //   },
    //   targetKey: "student_id",
    // });

    await assignment.sync({ alter: true });
    return assignment;
  } catch (err) {
    console.log("assignment model", err.message);
  }
};

export default initassignmentModel;
