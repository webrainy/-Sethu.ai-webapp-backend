import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import initbatchModel from "../../models/batchModel.js";
import { ROLE, STATE } from "../../config/constants.js";
import initstudentmodel from "../../models/studentModel.js";
import moment from "moment";
import initaccountModel from "../../models/accountModel.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    // if (req.user.role != ROLE.ADMIN) {
    //   return send(res, RESPONSE.ACCESS_DENIED);
    // }

    let query = {
      isactive: STATE.ACTIVE,
    };

    let studentAttribute = [];

    req.query.batch_id
      ? (query.batch_id = req.query.batch_id) &&
        (studentAttribute = [
          "student_id",
          "name",
          "phone",
          "email",
          "comment",
          "education",
          "current_state",
          "batch_state",
          "dnc_state",
          "registered_on",
        ])
      : "";

    const batchModel = await initbatchModel();
    const studentModel = await initstudentmodel();
    const accountModel = await initaccountModel();

    let batchData = await batchModel.findAll({
      where: query,
      attributes: [
        "batch_id",
        "name",
        "start_date",
        "end_date",
        "technologies",
        "tutor",
        "lab_coordinator",
        "planned_hour",
        "actual_hour",
        "comment",
      ],
      include: [
        {
          model: accountModel,
          as: "createdBy",
          attributes: ["account_id", "name", "phone", "email", "role"],
        },
        {
          model: studentModel,
          as: "students",
          attributes: studentAttribute,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (batchData.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "batches"));
    }

    batchData = batchData.map((itm) => {
      return {
        ...itm.toJSON(),
        start_date:
          itm.start_date != null
            ? moment
                .utc(itm.start_date)
                .tz("Europe/Berlin")
                .format("YYYY-MM-DD HH:mm:ss")
            : "",
        end_date:
          itm.end_date != null
            ? moment
                .utc(itm.end_date)
                .tz("Europe/Berlin")
                .format("YYYY-MM-DD HH:mm:ss")
            : "",
      };
    });

    return send(res, RESPONSE.SUCCESS, batchData);
  } catch (error) {
    console.log("list batch", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
