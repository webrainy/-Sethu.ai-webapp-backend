import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { HASH_ROUND, ROLE, STATE } from "../../config/constants.js";
import bcrypt from "bcrypt";
import initaccountModel from "../../models/accountModel.js";
import initstudentmodel from "../../models/studentModel.js";

const router = Router();

export default router.post("/", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    let role;
    req.query.role == ROLE.ADMIN ? (role = ROLE.ADMIN) : (role = ROLE.REVIEWER);

    let accountModel = await initaccountModel();
    let studentModel = await initstudentmodel();

    if (name == "" || name == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "name"));
    }
    if (phone == "" || phone == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "phone"));
    }
    if (email == "" || email == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "email"));
    }
    if (password == "" || password == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "password"));
    }

    const emailPattern = String(email).match(
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    );

    if (!emailPattern) {
      return send(res, setErrResMsg(RESPONSE.INVALID, "Email"));
    }

    const pPattern = String(phone).match(/^\+\d{10,15}$/);
    if (!pPattern) {
      return send(res, setErrResMsg(RESPONSE.INVALID, "Phone"));
    }

    const pwdPattern = String(password).match(
      /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{6,32}$/
    );
    if (!pwdPattern) {
      return send(res, setErrResMsg(RESPONSE.INVALID, "password pattern"));
    }

    let isphoneExist = await accountModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        phone,
      },
    });

    let isemailExist = await accountModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        email,
      },
    });

    let isStudentphoneExist = await studentModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        phone,
      },
    });

    let isStudentemailExist = await studentModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        email,
      },
    });

    if (isphoneExist || isStudentphoneExist) {
      return send(
        res,
        setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this phone")
      );
    }
    if (isemailExist || isStudentemailExist) {
      return send(
        res,
        setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this email")
      );
    }

    const encryptedPassword = await bcrypt.hash(password, HASH_ROUND);

    await accountModel.create({
      ...req.body,
      role: role,
      password: encryptedPassword,
    });

    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("create account", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
