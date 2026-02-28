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
// import { sendEmails } from "../../middlewares/emailMessage.js";
import initeventModel from "../../models/eventModel.js";
import authenticate from "../../middlewares/authenticate.js";
import initAssignmentItm from "../../models/eventitmModel.js";
import initstudentmodel from "../../models/studentModel.js";
import moment from "moment";
import { resendMail } from "../../middlewares/resend.js";
const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    // if (req.user.role != ROLE.ADMIN) {
    //   return send(res, RESPONSE.ACCESS_DENIED);
    // }

    let {
      //   exstng_assign,
      title,
      event_descriprion,
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
      event_descriprion,
      datetime,
      event_type,
      batch_id: batch_id,
      student_id: student_id,
      account_id: req.user.id,
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

      let message = {
        subject: `Meeting Link for Sri Sathya Sai Skill Development Program on ${moment(
          datetime,
        ).format("LL")}`,

        text: `Dear ${student.name},

We are pleased to invite you to the upcoming meeting for the Sri Sathya Sai Skill Development Program. Please find the details below:

📅 Date: ${moment(datetime).format("LL")}
⏰ Time: ${moment(datetime).format("LT")}
🔗 Meeting Link: ${url}

Please ensure you join the meeting on time and have a stable internet connection. If you have any questions, feel free to reach out.

We look forward to your participation!

Best regards,
Program Coordinator
Sri Sathya Sai Skill Development Program
🌐 [www.sethu.ai](http://www.sethu.ai)
📞 9052372023`,
      };

      resendMail(student, message);
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
