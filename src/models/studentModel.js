import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";
import initbatchModel from "./batchModel.js";

const studentInfo = {
  student_id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  //personal info
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  //education info
  education: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cgpa: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year_passed: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gmat: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  //preferences
  course_prep: {
    // Are you preparing for any course?
    type: DataTypes.STRING,
    allowNull: false,
  },
  curnt_work: {
    // What are you currently working on?
    type: DataTypes.STRING,
    allowNull: false,
  },
  commit_ft: {
    //Can you commit 3 months full-time (8 hours/day) in Hyderabad?
    type: DataTypes.STRING,
    allowNull: false,
  },

  //Skills and Expertise
  sk_python: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sk_sql: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sk_java: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sk_analyticalskill: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sk_prblmsolving: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sk_engprof: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  hckr_rnk: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  //Additional Information:
  hobbies: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  linkedin_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  github_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resume: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coverletter: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  //other info
  father_occ: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mother_occ: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  income: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  review: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  current_state: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  role: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isactive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
};

let student = null;
const initstudentmodel = async () => {
  try {
    if (student) return student;
    const sequelize = await getConnection();
    student = sequelize.define("studentmodel", studentInfo, {
      freezeTableName: true,
    });

    const batch = await initbatchModel();
    student.belongsTo(batch, {
      as: "batchInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
        name: "batch_id",
      },
      targetKey: "batch_id",
    });

    batch.hasMany(student, {
      as: "batchInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
        name: "batch_id",
      },
      targetKey: "batch_id",
    });

    await student.sync({ alter: true });
    return student;
  } catch (err) {
    console.log("student model", err.message);
  }
};

export default initstudentmodel;
