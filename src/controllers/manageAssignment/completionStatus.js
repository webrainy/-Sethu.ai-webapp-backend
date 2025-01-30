import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import initAssignmentItm from "../../models/assignmentItm.js";
import { COMPLITION_STATUS } from "../../config/constants.js";
import authenticate from "../../middlewares/authenticate.js";

const router = Router();

export default router.put("/", authenticate, async (req, res) => {
  try {
    const assignmentItmModel = await initAssignmentItm();

    const assign_id = req.query.assign_id;
    const compl_status = req.body.compl_status;
    let updates = {};

    if (!assign_id || assign_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "assign_id"));
    }

    if (compl_status || compl_status != undefined) {
      if (compl_status == COMPLITION_STATUS.COMPLETED) {
        updates.compl_status = compl_status;
        updates.completed_at = Date.now();
      } else {
        updates.compl_status = compl_status;
      }
    }

    await assignmentItmModel.update(updates, {
      where: { assign_id: assign_id },
    });

    return send(res, RESPONSE.SUCCESS);
  } catch (error) {
    console.log("completion statu", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
