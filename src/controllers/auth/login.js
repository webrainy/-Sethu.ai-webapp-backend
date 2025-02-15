import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { BATCH_STATE, CURRENT_STATE, STATE } from "../../config/constants.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import initaccountModel from "../../models/accountModel.js";
import { Op } from "sequelize";
import initstudentmodel from "../../models/studentModel.js";

const router = Router();

export default router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    let accountModel = await initaccountModel();
    let studentModel = await initstudentmodel();

    if (username == "" || username == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "username"));
    }

    if (password == "" || password == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "password"));
    }

    let accountData = await accountModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        [Op.or]: [{ email: username }, { phone: username }],
      },
    });

    let studentData = await studentModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        batch_state: BATCH_STATE.ASSIGNED,
        [Op.or]: [{ email: username }, { phone: username }],
      },
    });

    let userData = accountData || studentData;

    let response = {};

    if (accountData) {
      response = {
        id: accountData.account_id,
        role: accountData.role,
        name: accountData.name,
        phone: accountData.phone,
        email: accountData.email,
      };
    } else if (studentData) {
      response = { id: studentData.student_id, role: studentData.role };
    }

    if (userData && (await bcrypt.compare(password, userData.password))) {
      const token = jwt.sign(response, process.env.TOKEN_KEY);

      return send(res, RESPONSE.SUCCESS, {
        role: accountData ? accountData.role : studentData.role,
        access_token: token,
      });
    } else {
      return send(res, setErrResMsg(RESPONSE.INVALID, "Login credential"));
    }
  } catch (err) {
    console.log("login: ", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
