import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";

import initeventModel from "./eventModel.js";
import initstudentmodel from "./studentModel.js";

const eventItmModel = {
  ev_id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },

  isactive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
};

let eventItm = null;
const initEventItm = async () => {
  try {
    if (eventItm) return eventItm;
    const sequelize = await getConnection();
    eventItm = sequelize.define("eventitem", eventItmModel, {
      freezeTableName: true,
    });

    const student = await initstudentmodel();
    const event = await initeventModel();

    eventItm.belongsTo(student, {
      as: "studentInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        name: "student_id",
      },
      targetKey: "student_id",
    });

    student.hasMany(eventItm, {
      as: "studentInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        name: "student_id",
      },
      targetKey: "student_id",
    });

    eventItm.belongsTo(event, {
      as: "eventInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        name: "event_id",
      },
      targetKey: "event_id",
    });

    event.hasMany(eventItm, {
      as: "eventInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        name: "event_id",
      },
      targetKey: "event_id",
    });

    await eventItm.sync({ alter: true });
    return eventItm;
  } catch (err) {
    console.log("Event Item Model :", err.message);
  }
};

export default initEventItm;
