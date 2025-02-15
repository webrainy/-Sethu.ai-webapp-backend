import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initaccountModel from "../../models/accountModel.js";
import initstudentmodel from "../../models/studentModel.js";
import initexamModel from "../../models/examModel.js";
import initinterviewModel from "../../models/interviewModel.js";
import { Op } from "sequelize";
import initbatchModel from "../../models/batchModel.js";
import moment from "moment";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    const accountModel = await initaccountModel();

    let query = {
      isactive: STATE.ACTIVE,
      role: ROLE.SUB_ADMIN,
    };

    let adminData = await accountModel.findAll({
      where: query,
      attributes: ["account_id", "name", "phone", "email"],
      order: [["createdAt", "DESC"]],
    });

    if (adminData.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "admin data"));
    }

    return send(res, RESPONSE.SUCCESS, adminData);
  } catch (error) {
    console.log("List admin", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
