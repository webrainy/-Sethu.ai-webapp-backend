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
import image from "../../middlewares/uploads.js";
import bcrypt from "bcrypt";
import { deletefile } from "../../middlewares/deleteFile.js";
import initstudentmodel from "../../models/studentModel.js";
import initaccountmodel from "../../models/accountModel.js";
import { sendEmails } from "../../middlewares/emailMessage.js";
import authenticate from "../../middlewares/authenticate.js";

const imagedir = "document/";
const uploads = image(imagedir).fields([
  { name: "resume", maxCount: 1 },
  { name: "profile", maxCount: 1 },
]);
const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    const { old_password, new_password, confirm_password } = req.body;

    let accountModel = await initaccountmodel();

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
      /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{6,32}$/
    );
    if (!pwdPattern) {
      return send(res, setErrResMsg(RESPONSE.INVALID, "password pattern"));
    }

    if (new_password != confirm_password) {
      return send(res, setErrResMsg(RESPONSE.NOT_MATCH, "password & confirm password"));
    }

    const accountdata = await accountModel.findOne({
      where: { account_id: req.user.id },
    });

    const validOldPassword = await bcrypt.compare(
      old_password,
      accountdata.password
    );

    if (validOldPassword == true) {
      const encryptPassword = await bcrypt.hash(new_password, HASH_ROUND);
      await accountModel.update(
        { password: encryptPassword },
        { where: { account_id: req.user.id } }
      );

      return send(res, RESPONSE.SUCCESS);
    } else {
      return send(res, setErrResMsg(RESPONSE.INVALID, "Old password"));
    }
  } catch (err) {
    console.log("reset password", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
