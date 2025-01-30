import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";

import initassignmentModel from "./assignment.js";
import initstudentmodel from "./studentModel.js";

const assignmentItmModel = {
  assign_id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  compl_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assigned_on: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isactive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
};

let assignmentItm = null;
const initAssignmentItm = async () => {
  try {
    if (assignmentItm) return assignmentItm;
    const sequelize = await getConnection();
    assignmentItm = sequelize.define("workassigned", assignmentItmModel, {
      freezeTableName: true,
    });

    const student = await initstudentmodel();
    const assignment = await initassignmentModel();

    assignmentItm.belongsTo(student, {
      as: "studentInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        name: "student_id",
      },
      targetKey: "student_id",
    });

    student.hasMany(assignmentItm, {
      as: "assignments",
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        name: "student_id",
      },
      targetKey: "student_id",
    });

    assignmentItm.belongsTo(assignment, {
      as: "assignmentInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        name: "assignment_id",
      },
      targetKey: "assignment_id",
    });

    assignment.hasMany(assignmentItm, {
      as: "assignmentInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        name: "assignment_id",
      },
      targetKey: "assignment_id",
    });

    await assignmentItm.sync({ alter: true });
    return assignmentItm;
  } catch (err) {
    console.log("Assignment Item Model :", err.message);
  }
};

export default initAssignmentItm;
