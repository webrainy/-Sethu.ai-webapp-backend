import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import authenticate from "../../middlewares/authenticate.js";
import { Op } from "sequelize";
import initattendanceItm from "../../models/attendanceitmModel.js";

const router = Router();

export default router.put("/", authenticate, async (req, res) => {
  try {
    const att_id = req.query.att_id;

    const attendance_status = req.body.attendance_status;

    let attendanceItmModel = await initattendanceItm();
    let updates = {};
    if (att_id == "" || att_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "att_id"));
    }

    if (attendance_status && attendance_status != undefined) {
      updates.attendance_status = attendance_status;
    }

    await attendanceItmModel.update(updates, {
      where: { att_id: att_id },
    });
    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("edit batch", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
