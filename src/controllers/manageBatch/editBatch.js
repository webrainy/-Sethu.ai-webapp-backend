import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initbatchModel from "../../models/batchModel.js";
import authenticate from "../../middlewares/authenticate.js";
import { Op } from "sequelize";

const router = Router();

export default router.put("/", authenticate, async (req, res) => {
  try {
    // if (req.user.role != ROLE.ADMIN) {
    //   return send(res, RESPONSE.ACCESS_DENIED);
    // }

    const batch_id = req.query.batch_id;

    const {
      name,
      start_date,
      end_date,
      technologies,
      tutor,
      lab_coordinator,
      planned_hour,
      actual_hour,
      comment,
    } = req.body;

    let batchModel = await initbatchModel();
    let updates = {};
    if (batch_id == "" || batch_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
    }

    if (name && name != undefined) {
      let isBatchExists = await batchModel.findOne({
        where: {
          isactive: STATE.ACTIVE,
          name: name,
          batch_id: { [Op.ne]: batch_id },
        },
      });

      if (isBatchExists) {
        return send(
          res,
          setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this batch")
        );
      } else {
        updates.name = name;
      }
    }
    if (start_date && start_date != undefined) {
      updates.start_date = start_date;
    }
    if (end_date && end_date != undefined) {
      updates.end_date = end_date;
    }
    if (technologies && technologies != undefined) {
      updates.technologies = technologies;
    }
    if (tutor && tutor != undefined) {
      updates.tutor = tutor;
    }
    if (lab_coordinator && lab_coordinator != undefined) {
      updates.lab_coordinator = lab_coordinator;
    }
    if (planned_hour && planned_hour != undefined) {
      updates.planned_hour = planned_hour;
    }
    if (actual_hour && actual_hour != undefined) {
      updates.actual_hour = actual_hour;
    }
    if (comment && comment != undefined) {
      updates.comment = comment;
    }

    await batchModel.update(updates, {
      where: { batch_id: batch_id },
    });
    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("edit batch", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
