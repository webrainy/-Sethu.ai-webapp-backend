import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import {
  BATCH_STATE,
  CURRENT_STATE,
  ROLE,
  STATE,
} from "../../config/constants.js";
import initbatchModel from "../../models/batchModel.js";
import initstudentModel from "../../models/studentModel.js";
import authenticate from "../../middlewares/authenticate.js";
import { sendEmails } from "../../middlewares/emailMessage.js";

const router = Router();

export default router.put("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    const student_id = req.query.student_id;
    const {
      current_state,
      batch_state,
      review_state,
      reviewer_id,
      dnc_state,
      comment,
      batch_id,
      account_id,
      exam_title,
      exam_datetime,
      exam_url,
      exam_result,
      exam_marks,
      int_title,
      int_url,
      int_datetime,
      int_result,
    } = req.body;

    let studentModel = await initstudentModel();
    let batchModel = await initbatchModel();

    let updates = {};

    if (student_id == "" || student_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "student_id"));
    }

    if (current_state == "" || current_state == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "current_state"));
    }

    if (comment && comment != undefined) {
      updates.comment = comment;
    }
    if (dnc_state && dnc_state != undefined) {
      updates.dnc_state = dnc_state;
    }

    if (current_state == CURRENT_STATE.IN_PROGRESS) {
      updates.current_state = CURRENT_STATE.IN_PROGRESS;
    } else if (current_state == CURRENT_STATE.ACCEPTED) {
      updates.current_state = CURRENT_STATE.ACCEPTED;
    } else if (current_state == CURRENT_STATE.FOLLOW_UP) {
      updates.current_state = CURRENT_STATE.FOLLOW_UP;
    } else if (current_state == CURRENT_STATE.REJECTED) {
      updates.current_state = CURRENT_STATE.REJECTED;
    } else if (current_state == CURRENT_STATE.UNABLE_TO_DECIDE) {
      updates.current_state = CURRENT_STATE.UNABLE_TO_DECIDE;
    }

    if (batch_state && batch_state != undefined) {
      if (batch_state == BATCH_STATE.ASSIGNED) {
        if (batch_id == "" || batch_id == undefined) {
          return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
        } else {
          {
            let batch = await batchModel.findOne({
              where: {
                batch_id,
              },
            });

            let student = await studentModel.findOne({
              where: {
                student_id,
              },
            });

            //     let message = {
            //       subject: `🎯 You’ve Been Assigned to a Batch!`,

            //       text: `Dear ${student.name},

            // You have been assigned to Batch ${batch.name} for your Python Training.

            // If you have any questions, feel free to reach out.

            // Best Regards,
            // Your Instructor`,
            //     };

            //     sendEmails(student, message);
          }

          updates.batch_state = BATCH_STATE.ASSIGNED;
          updates.batch_id = batch_id;
        }
      } else {
        updates.batch_id = BATCH_STATE.NOT_ASSIGNED;
      }
    }

    if (review_state && review_state != undefined) {
      if (review_state == BATCH_STATE.ASSIGNED) {
        if (reviewer_id == "" || reviewer_id == undefined) {
          return send(res, setErrResMsg(RESPONSE.REQUIRED, "reviewer_id"));
        } else {
          updates.batch_state = BATCH_STATE.ASSIGNED;
          updates.batch_id = batch_id;
        }
      } else {
        updates.batch_id = BATCH_STATE.NOT_ASSIGNED;
      }
    }

    // } else {
    //   updates.current_state = current_state;
    //   updates.batch_id = null;
    // }

    // await studentModel.update(updates, {
    //   where: { student_id: student_id },
    // });

    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("Update student", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
