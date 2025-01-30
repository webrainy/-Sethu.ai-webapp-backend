import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initassignmentModel from "../../models/assignment.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const batch_id = req.query.batch_id;

    if (batch_id == "" || batch_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
    }

    const assignmentModel = await initassignmentModel();

    let batchAssignment = await assignmentModel.findAll({
      where: {
        isactive: STATE.ACTIVE,
        batch_id: batch_id,
      },
      attributes: ["assignment_id", "title", "description", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    if (batchAssignment.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "batch assignments"));
    }

    return send(res, RESPONSE.SUCCESS, batchAssignment);
  } catch (error) {
    console.log("list assignment", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
