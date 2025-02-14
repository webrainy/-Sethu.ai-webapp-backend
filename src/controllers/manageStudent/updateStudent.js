import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import {
  BATCH_STATE,
  CURRENT_STATE,
  RESULT,
  ROLE,
  STATE,
} from "../../config/constants.js";
import initbatchModel from "../../models/batchModel.js";
import initstudentModel from "../../models/studentModel.js";
import authenticate from "../../middlewares/authenticate.js";
import { sendEmails } from "../../middlewares/emailMessage.js";
import initexamModel from "../../models/examModel.js";
import initinterviewModel from "../../models/interviewModel.js";

const router = Router();

export default router.put("/", authenticate, async (req, res) => {
  try {
    // if (req.user.role != ROLE.ADMIN) {
    //   return send(res, RESPONSE.ACCESS_DENIED);
    // }

    const student_id = req.query.student_id;
    const {
      current_state,
      batch_state,
      dnc_state,
      comment,
      batch_id,
      account_id,
      exam_datetime,
      exam_result,
      exam_marks,
      int_datetime,
      int_result,
    } = req.body;

    let studentModel = await initstudentModel();
    let batchModel = await initbatchModel();
    let examModel = await initexamModel();
    let interviewModel = await initinterviewModel();

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

    if (exam_datetime && exam_datetime != undefined) {
      let exam = await examModel.findOne({
        where: {
          student_id,
        },
      });

      if (exam) {
        await examModel.update(
          {
            exam_datetime,
            exam_result: exam_result ? exam_result : RESULT.PENDING,
            exam_marks: exam_marks ? exam_marks : null,
          },
          {
            where: { exam_id: exam.exam_id },
          }
        );
      } else {
        await examModel.create({
          exam_datetime,
          exam_result: exam_result ? exam_result : RESULT.PENDING,
          exam_marks: exam_marks ? exam_marks : null,
          student_id: student_id,
        });
      }
    }

    if (int_datetime && int_datetime != undefined) {
      let interview = await interviewModel.findOne({
        where: {
          student_id,
        },
      });

      if (interview) {
        await interviewModel.update(
          {
            int_datetime,
            int_result: int_result ? int_result : RESULT.PENDING,
          },
          {
            where: { interview_id: interview.interview_id },
          }
        );
      } else {
        await interviewModel.create({
          int_datetime,
          int_result: int_result ? int_result : RESULT.PENDING,
          student_id,
        });
      }
    }

    if (current_state == CURRENT_STATE.REJECTED) {
      updates.current_state = CURRENT_STATE.REJECTED;
    } else {
      updates.current_state = current_state;
    }

    if (account_id && account_id != undefined) {
      updates.account_id = account_id;
    }

    if (batch_state && batch_state != undefined) {
      if (batch_state == BATCH_STATE.ASSIGNED) {
        if (batch_id == "" || batch_id == undefined) {
          return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
        } else {
          //send grid
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
          {
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
          student.selected_on == null ? (updates.selected_on = new Date()) : "";
          updates.batch_state = BATCH_STATE.ASSIGNED;
          updates.batch_id = batch_id;
        }
      } else {
        updates.batch_state = BATCH_STATE.NOT_ASSIGNED;
      }
    }

    await studentModel.update(updates, {
      where: {
        student_id: student_id,
      },
    });
    return send(res, RESPONSE.SUCCESS);
  } catch (err) {
    console.log("Update student", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
