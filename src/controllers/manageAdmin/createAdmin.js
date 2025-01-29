import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import {
  CURRENT_STATE,
  HASH_ROUND,
  ROLE,
  STATE,
} from "../../config/constants.js";
import bcrypt from "bcrypt";
import initadminModel from "../../models/adminModel.js";

const router = Router();

export default router.post("/", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    let adminModel = await initadminModel();

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

    let isphoneExist = await adminModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        phone,
      },
    });

    let isemailExist = await adminModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        email,
      },
    });

    if (isphoneExist) {
      return send(
        res,
        setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this phone")
      );
    }
    if (isemailExist) {
      return send(
        res,
        setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this email")
      );
    }

    const encryptedPassword = await bcrypt.hash(password, HASH_ROUND);

    await adminModel.create({
      ...req.body,
      role: ROLE.ADMIN,
      password: encryptedPassword,
    });

    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("create admin", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
