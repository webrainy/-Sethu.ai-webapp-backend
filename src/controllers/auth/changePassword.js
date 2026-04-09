import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import {
  CURRENT_STATE,
  DNC_STATE,
  HASH_ROUND,
  ROLE,
  STATE,
} from "../../config/constants.js";
// import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import initstudentmodel from "../../models/studentModel.js";
import initaccountmodel from "../../models/accountModel.js";
// import { sendEmails } from "../../middlewares/emailMessage.js";
import authenticate from "../../middlewares/authenticate.js";

const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    const { old_password, new_password, confirm_password } = req.body;

    let accountModel = await initaccountmodel();
    let studentModel = await initstudentmodel();

    if (old_password == "" || old_password == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "old_password"));
    }
    if (new_password == "" || new_password == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "new_password"));
    }
    if (confirm_password == "" || confirm_password == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "confirm_password"));
    }
    const pwdPattern = String(new_password).match(
      /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{6,32}$/,
    );
    if (!pwdPattern) {
      return send(res, setErrResMsg(RESPONSE.INVALID, "password pattern"));
    }

    if (new_password != confirm_password) {
      return send(
        res,
        setErrResMsg(RESPONSE.NOT_MATCH, "password & confirm password"),
      );
    }

    let accountdata;

    if (req.user.role == ROLE.STUDENT) {
      accountdata = await studentModel.findOne({
        where: { student_id: req.user.id },
      });
    } else {
      accountdata = await accountModel.findOne({
        where: { account_id: req.user.id },
      });
    }

    // const validOldPassword = await bcrypt.compare(
    //   old_password,
    //   accountdata.password
    // );

    const bytes = CryptoJS.AES.decrypt(
      accountdata.password,
      process.env.TOKEN_KEY,
    );
    const decryptPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (decryptPassword == old_password) {
      // const encryptPassword = await bcrypt.hash(new_password, HASH_ROUND);
      const encryptPassword = CryptoJS.AES.encrypt(
        new_password,
        process.env.TOKEN_KEY,
      ).toString();

      if (req.user.role == ROLE.STUDENT) {
        await studentModel.update(
          { password: encryptPassword },
          { where: { student_id: req.user.id } },
        );
      } else {
        await accountModel.update(
          { password: encryptPassword },
          { where: { account_id: req.user.id } },
        );
      }

      return send(res, RESPONSE.SUCCESS);
    } else {
      return send(res, setErrResMsg(RESPONSE.INVALID, "Old password"));
    }
  } catch (err) {
    console.log("reset password", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
