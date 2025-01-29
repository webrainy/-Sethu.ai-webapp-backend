import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { STATE } from "../../config/constants.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import initadminModel from "../../models/adminModel.js";
import { Op } from "sequelize";
import initstudentmodel from "../../models/studentModel.js";

const router = Router();

export default router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    let adminModel = await initadminModel();
    let studentModel = await initstudentmodel();

    if (username == "" || username == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "username"));
    }

    if (password == "" || password == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "password"));
    }

    let adminData = await adminModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        [Op.or]: [{ email: username }, { phone: username }],
      },
    });

    let studentData = await studentModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        [Op.or]: [{ email: username }, { phone: username }],
      },
    });

    let userData = adminData || studentData;

    if (userData && (await bcrypt.compare(password, userData.password))) {
      const token = jwt.sign(
        {
          id: adminData ? adminData.admin_id : studentData.student_id,
          role: adminData ? adminData.role : studentData.role,
        },
        process.env.TOKEN_KEY
      );

      return send(res, RESPONSE.SUCCESS, {
        role: adminData ? adminData.role : studentData.role,
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
