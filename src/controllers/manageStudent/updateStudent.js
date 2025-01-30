import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { CURRENT_STATE, ROLE, STATE } from "../../config/constants.js";
import initbatchModel from "../../models/batchModel.js";
import initstudentModel from "../../models/studentModel.js";
import authenticate from "../../middlewares/authenticate.js";
import { Op } from "sequelize";

const router = Router();

export default router.put("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const student_id = req.query.student_id;
    const { current_state, review, batch_id } = req.body;

    let studentModel = await initstudentModel();
    let updates = {};

    if (student_id == "" || student_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "student_id"));
    }

    if (current_state == "" || current_state == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "current_state"));
    }

    if (review || review != undefined) {
      updates.review = review;
    }

    if (current_state == Number(CURRENT_STATE.ASSIGNED)) {
      if (batch_id == "" || batch_id == undefined) {
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
      } else {
        updates.current_state = current_state;
        updates.batch_id = batch_id;
      }
    }

    await studentModel.update(updates, {
      where: { student_id: student_id },
    });

    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("update student", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
