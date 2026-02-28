import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";
import initbatchModel from "./batchModel.js";
import initaccountModel from "./accountModel.js";

const eventModel = {
  event_id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  datetime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  event_type: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  event_descriprion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isactive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
};

let event = null;
const initeventModel = async () => {
  try {
    if (event) return event;
    const sequelize = await getConnection();
    event = sequelize.define("event", eventModel, {
      freezeTableName: true,
    });

    const batch = await initbatchModel();
    // const student = await initstudentmodel();

    event.belongsTo(batch, {
      as: "batchInfo",
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
        name: "batch_id",
      },
      targetKey: "batch_id",
    });

    const user = await initaccountModel();
    event.belongsTo(user, {
      as: "createdBy",
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
        name: "account_id",
      },
      targetKey: "account_id",
    });

    await event.sync({ alter: true });
    return event;
  } catch (err) {
    console.log("event model", err.message);
  }
};

export default initeventModel;
