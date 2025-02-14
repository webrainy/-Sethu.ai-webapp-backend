import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initbatchModel from "../../models/batchModel.js";
import authenticate from "../../middlewares/authenticate.js";

const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const {
      name,
      start_date,
      end_date,
      technologies,
      tutor,
      lab_coordinator,
      planned_hour,
      actual_hour,comment
    } = req.body;

    let batchModel = await initbatchModel();

    if (name == "" || name == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "name"));
    }
    if (start_date == "" || start_date == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "start_date"));
    }
    if (end_date == "" || end_date == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "end_date"));
    }
    if (technologies == "" || technologies == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "technologies"));
    }
    if (tutor == "" || tutor == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "tutor"));
    }
    if (lab_coordinator == "" || lab_coordinator == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "lab_coordinator"));
    }
    if (planned_hour == "" || planned_hour == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "planned_hour"));
    }
    if (actual_hour == "" || actual_hour == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "actual_hour"));
    }
    
    let isBatchExists = await batchModel.findOne({
      where: {
        isactive: STATE.ACTIVE,
        name,
      },
    });

    if (isBatchExists) {
      return send(
        res,
        setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this batch")
      );
    }

    await batchModel.create({
      ...req.body,
    });

    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("create batch", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
