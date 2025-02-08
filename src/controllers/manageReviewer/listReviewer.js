import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initaccountModel from "../../models/accountModel.js";
import initstudentmodel from "../../models/studentModel.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    const accountModel = await initaccountModel();
    const studentModel = await initstudentmodel();
    let studentAttribute = [];
    let query = {
      isactive: STATE.ACTIVE,
      role: ROLE.REVIEWER,
    };
    1;
    if (req.user.role == ROLE.REVIEWER) {
      query.account_id = req.user.id;
      studentAttribute = ["student_id", "name", "phone", "email"];
    } else if (req.query.account_id) {
      query.account_id = req.query.account_id;
      studentAttribute = ["student_id", "name", "phone", "email"];
    }

    console.log();

    let reviewerData = await accountModel.findAll({
      where: query,
      attributes: ["account_id", "name", "phone", "email"],
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: studentModel,
          as: "studentInfo",
          attributes: studentAttribute,
        },
      ],
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
