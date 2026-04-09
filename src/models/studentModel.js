import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";
import initbatchModel from "./batchModel.js";
import initinterviewModel from "./interviewModel.js";
import initexamModel from "./examModel.js";
import initaccountModel from "./accountModel.js";
import { BATCH_STATE, CURRENT_STATE, DNC_STATE } from "../config/constants.js";
import { type } from "os";
import { timeStamp } from "console";

const studentInfo = {
  student_id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  //roll no fields
  rollno: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sequence: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  dob: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  college: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true,
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
    allowNull: true,
  },
  github_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  iq_level: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  attitude: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  aspiration: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resume: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // coverletter: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  profile: {
    type: DataTypes.STRING,
    allowNull: true,
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
  comment: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  current_state: {
    type: DataTypes.INTEGER,
    defaultValue: CURRENT_STATE.NOT_STARTED,
  },
  batch_state: {
    type: DataTypes.INTEGER,
    defaultValue: BATCH_STATE.NOT_ASSIGNED,
  },
  dnc_state: {
    //Do not call again status
    type: DataTypes.INTEGER,
    defaultValue: DNC_STATE.CALL,
  },
  has_laptop: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  got_to_know_from: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  registered_on: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  selected_on: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isactive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  isrefered: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
  },
  referedby: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  course_source: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
};

let student = null;
const initstudentmodel = async () => {
  try {
    if (student) return student;
    const sequelize = await getConnection();
    student = sequelize.define("studentmodel", studentInfo, {
      freezeTableName: true,
      timestamps: true,
    });

    const batch = await initbatchModel();
    if (!batch) throw new Error("Batch model not initialized");
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
      as: "students",
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
        name: "batch_id",
      },
      targetKey: "batch_id",
    });

    const reviewer = await initaccountModel();
    reviewer.hasMany(student, {
      as: "studentInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
        name: "account_id",
      },
      targetKey: "account_id",
    });

    student.belongsTo(reviewer, {
      as: "reviewerInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
        name: "account_id",
      },
      targetKey: "account_id",
    });

    student.belongsTo(reviewer, {
      as: "assignedBy",
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
        name: "acc_id",
      },
      targetKey: "account_id",
    });

    await student.sync({ alter: true });
    return student;
  } catch (err) {
    console.log("student model", err.message);
  }
};

export default initstudentmodel;
