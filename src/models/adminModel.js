import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";

const adminModel = {
  admin_id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
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
  role: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // fcm_token: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  // },

  isactive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
};

let admin = null;
const initadminModel = async () => {
  try {
    if (admin) return admin;
    const sequelize = await getConnection();
    admin = sequelize.define("adminmodel", adminModel, {
      freezeTableName: true,
    });
    await admin.sync({ alter: true });
    return admin;
  } catch (err) {
    console.log("admin model", err.message);
  }
};

export default initadminModel;
