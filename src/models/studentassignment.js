import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";
import initstudentmodel from "./studentModel.js";
import initbatchModel from "./batchModel.js";
// ❌ REMOVE: import initassignmentItmModel from "./assignmentItm.js";

let student_assignment = null;

let initstudentassignment = async () => {
  try {
    if (student_assignment) return student_assignment;
    const sequelize = await getConnection();

    student_assignment = sequelize.define(
      "student_assignment",
      {
        stassign_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        // ✅ ADD assign_id column here
        assign_id: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        assignment_url: { type: DataTypes.STRING, allowNull: true },
        assignment_doc: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
          defaultValue: [],
        },
        assignment_description: { type: DataTypes.STRING, allowNull: true },
        st_assignment_status: { type: DataTypes.INTEGER, defaultValue: 1 },
        isactive: { type: DataTypes.INTEGER, defaultValue: 1 },
      },
      { freezeTableName: true, timestamps: true },
    );

    const student = await initstudentmodel();
    const batch = await initbatchModel();

    student_assignment.belongsTo(student, {
      foreignKey: "student_id",
      as: "studentinfo",
      onDelete: "cascade",
    });

    student_assignment.belongsTo(batch, {
      foreignKey: "batch_id",
      as: "batchInfo",
      onDelete: "cascade",
    });

    // ✅ Lazy import to avoid circular dependency
    const { default: initassignmentItmModel } =
      await import("./assignmentItm.js");
    const assignmentItm = await initassignmentItmModel();

    student_assignment.belongsTo(assignmentItm, {
      foreignKey: "assign_id",
      as: "assignmentItm",
      onDelete: "cascade",
    });

    batch.hasMany(student_assignment, {
      foreignKey: "batch_id",
      as: "batchAssignments",
    });

    await student_assignment.sync({ alter: true });
    return student_assignment;
  } catch (error) {
    console.log("Student Assignment Model:", error);
  }
};

export default initstudentassignment;
