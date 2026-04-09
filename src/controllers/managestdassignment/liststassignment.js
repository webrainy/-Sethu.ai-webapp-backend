import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import initstudentassignment from "../../models/studentassignment.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE } from "../../config/constants.js";

const route = Router();

export default route.get("/", authenticate, async (req, res) => {
  try {
    let where = {};

    if (req.user.role == ROLE.STUDENT) {
      where.student_id = req.user.id;
    }
    if (req.user.role == ROLE.ADMIN && req.query.student_id) {
      where.student_id = req.query.student_id;
    }

    let assignmentmodel = await initstudentassignment();

    let assignmentData = await assignmentmodel.findAll({
      where,
    });

    return send(res, RESPONSE.SUCCESS, assignmentData);
  } catch (error) {
    console.log("List Student Assignment Error", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
