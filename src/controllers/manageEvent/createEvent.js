import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import {
  COMPLITION_STATUS,
  EVENT_TYPE,
  EXISTING_ASSIGNMENT,
  ROLE,
  STATE,
} from "../../config/constants.js";
import { sendEmails } from "../../middlewares/emailMessage.js";
import initeventModel from "../../models/eventModel.js";
import authenticate from "../../middlewares/authenticate.js";
import initAssignmentItm from "../../models/eventitmModel.js";
import initstudentmodel from "../../models/studentModel.js";

const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    // if (req.user.role != ROLE.ADMIN) {
    //   return send(res, RESPONSE.ACCESS_DENIED);
    // }

    let {
      //   exstng_assign,
      title,

      url,
      datetime,
      event_type,
      //   event_id,
      student_id,
      batch_id,
    } = req.body;

    let eventModel = await initeventModel();
    let eventItmModel = await initAssignmentItm();
    let studentModel = await initstudentmodel();

    // if (exstng_assign == "" || exstng_assign == undefined) {
    //   return send(res, setErrResMsg(RESPONSE.REQUIRED, "exstng_assign"));
    // }
    if (batch_id == "" || batch_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
    }
    if (student_id == "" || student_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "student_id"));
    }

    if (!Array.isArray(student_id)) {
      student_id = [student_id];
    }

    // let assigned_on = Date.now();

    // if (exstng_assign == EXISTING_ASSIGNMENT.NO) {

    if (event_type == "" || event_type == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "event_type"));
    }
    if (title == "" || title == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "title"));
    }

    if (datetime == "" || datetime == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "datetime"));
    }
    let event = await eventModel.create({
      title,
      url,
      datetime,
      event_type,
      batch_id: batch_id,
    });

    for (let i = 0; i < student_id.length; i++) {
      await eventItmModel.create({
        student_id: student_id[i],
        event_id: event.event_id,
      });
      let student = await studentModel.findOne({
        where: {
          isactive: STATE.ACTIVE,
          student_id: student_id[i],
        },
      });

      // let message = {
      //   subject: `${
      //     event_type == EVENT_TYPE.INTERVIEW ? `Interview` : `Event`
      //   } Notification`,
      //   text: `Hello ${student.name},\n\nYou have a new ${
      //     event_type == EVENT_TYPE.INTERVIEW ? `interview` : `event`
      //   }. Check your portal.\n\nBest,\nYour Instructor`,
      // };

      // sendEmails(student, message);
    }
    // }

    // else if (exstng_assign == EXISTING_ASSIGNMENT.YES) {
    //   if (event_id == "" || event_id == undefined) {
    //     return send(res, setErrResMsg(RESPONSE.REQUIRED, "event_id"));
    //   }

    //   for (let i = 0; i < student_id.length; i++) {
    //     await eventItmModel.create({
    //       compl_status: COMPLITION_STATUS.PENDING,
    //       assigned_on: assigned_on,
    //       student_id: student_id[i],
    //       event_id: event_id,
    //     });

    //     let student = await studentModel.findOne({
    //       where: {
    //         isactive: STATE.ACTIVE,
    //         student_id: student_id[i],
    //       },
    //     });

    //     let message = {
    //       subject: `Event Notification`,
    //       text: `Hello ${student.name},\n\nYou have a new ${event_type == EVENT_TYPE.INTERVIEW?`interview` :`event`}event. Check your portal.\n\nBest,\nYour Instructor`,
    //     };

    //     sendEmails(student, message);
    //   }
    // }

    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("create event", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
