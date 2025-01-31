import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import initbatchModel from "../../models/batchModel.js";
import { ROLE, STATE } from "../../config/constants.js";
import initstudentmodel from "../../models/studentModel.js";
import initassignmentModel from "../../models/assignment.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

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
          "review",
          "education",
          "current_state",
        ])
      : "";

    const batchModel = await initbatchModel();
    const studentModel = await initstudentmodel();

    let batchData = await batchModel.findAll({
      where: query,
      attributes: ["batch_id", "name"],

      include: [
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

    batchData.map(async (itm) => {
      return {
        batch_id: itm.batch_id,
        name: itm.name,
        students: itm.students,
      };
    });

    return send(res, RESPONSE.SUCCESS, batchData);
  } catch (error) {
    console.log("list batch", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
