import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initaccountModel from "../../models/accountModel.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    const accountModel = await initaccountModel();

    let reviewerData = await accountModel.findAll({
      where: {
        isactive: STATE.ACTIVE,
        role: ROLE.REVIEWER,
      },
      attributes: ["account_id", "name", "phone", "email"],
      order: [["createdAt", "DESC"]],
    });

    if (reviewerData.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "reviewer data"));
    }

    return send(res, RESPONSE.SUCCESS, reviewerData);
  } catch (error) {
    console.log("List reviewer", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
