import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initaccountModel from "../../models/accountModel.js";
const router = Router();
import CryptoJS from "crypto-js";

export default router.get("/", authenticate, async (req, res) => {
  try {
    const accountModel = await initaccountModel();

    let query = {
      isactive: STATE.ACTIVE,
      role: ROLE.SUB_ADMIN,
    };

    let adminData = await accountModel.findAll({
      where: query,
      attributes: ["account_id", "name", "phone", "email", "password"],
      order: [["createdAt", "DESC"]],
    });

    if (adminData.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "admin data"));
    }

    adminData = adminData.map((itm) => {
      const bytes = CryptoJS.AES.decrypt(itm.password, process.env.TOKEN_KEY);
      const decryptPassword = bytes.toString(CryptoJS.enc.Utf8);
      return {
        ...itm.toJSON(),
        password: decryptPassword,
      };
    });

    return send(res, RESPONSE.SUCCESS, adminData);
  } catch (error) {
    console.log("List admin", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
