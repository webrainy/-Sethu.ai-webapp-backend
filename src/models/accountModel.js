import { DataTypes } from "sequelize";
import getConnection from "../helper/databaseConnection.js";

const accountModel = {
  account_id: {
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
  isactive: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
};

let account = null;

const initaccountModel = async () => {
  try {
    if (account) return account;

    const sequelize = await getConnection();

    account = sequelize.define("accountmodel", accountModel, {
      freezeTableName: true,
      timestamps: true,
    });

    await account.sync({ alter: true });

    return account;
  } catch (err) {
    console.log("account model", err.message);
  }
};

export default initaccountModel;
