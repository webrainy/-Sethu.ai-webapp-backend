import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initeventItmModel from "../../models/eventitmModel.js";
import initeventModel from "../../models/eventModel.js";
import initstudentmodel from "../../models/studentModel.js";
import initbatchModel from "../../models/batchModel.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    // if (req.user.role != ROLE.ADMIN) {
    //   return send(res, RESPONSE.ACCESS_DENIED);
    // }
    let student_id;
    if (req.user.role == ROLE.STUDENT) {
      student_id = req.user.id;
    } else {
      student_id = req.query.student_id;
      if (student_id == "" || student_id == undefined) {
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "student_id"));
      }
    }

    let query = {};

    req.query.event_type ? (query.event_type = req.query.event_type) : "";

    const eventItmModel = await initeventItmModel();
    const eventModel = await initeventModel();
    const studentModel = await initstudentmodel();
    const batchModel = await initbatchModel();

    let studentInfo = await studentModel.findAll({
      where: { isactive: STATE.ACTIVE, student_id: student_id },
      attributes: ["student_id", "name"],
      include: [
        {
          model: batchModel,
          as: "batchInfo",
          attributes: ["batch_id", "name"],
        },
      ],
    });

    let events = await eventItmModel.findAll({
      where: {
        isactive: STATE.ACTIVE,
        student_id: student_id,
      },
      include: [
        {
          model: eventModel,
          as: "eventInfo",
          where: query,
          attributes: [
            "event_id",
            "title",
            "url",
            "datetime",
            "event_type",
            "batch_id",
          ],
        },
      ],
      attributes: ["ev_id", "student_id", "event_id", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    // if (events.length == 0) {
    //   return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "event"));
    // }

    return send(res, RESPONSE.SUCCESS, { studentInfo, events });
  } catch (error) {
    console.log("list students event", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
