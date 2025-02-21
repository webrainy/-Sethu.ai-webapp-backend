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
// import { sendEmails } from "../../middlewares/emailMessage.js";
import { resendMail } from "../../middlewares/resend.js";
import initexamModel from "../../models/examModel.js";
import initinterviewModel from "../../models/interviewModel.js";
import moment from "moment";
import initaccountModel from "../../models/accountModel.js";
import path from "path";
const __dirname = path.resolve();
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
    let accountModel = await initaccountModel();

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
    let student = await studentModel.findOne({
      where: {
        student_id,
      },
    });

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

        let message = {
          subject: `Invitation to Written Test for Sri Sathya Sai Skill Development Program on ${moment(
            exam_datetime
          ).format("LL")}`,

          text: `Dear ${student.name},

We are pleased to inform you that your profile has been shortlisted for a Data Engineer course.
As the next step, we invite you to take a written test scheduled for:

📅 Date: ${moment(exam_datetime).format("LL")}
⏰ Time: ${moment(exam_datetime).format("LT")}
📍 Location: Khairatabad, opposite lane to Shadan College, Near Khairatabad Metro Station
🔗 Venue: https://goo.gl/maps/pLyUu3RZ5nhutjcf9

The test will assess your basics of programming skills, logical reasoning, and English grammar.
The question paper will consist of 20 questions, and you will have 60 mins to complete it.

Reply to this email to confirm your participation.
We look forward to seeing you there! Please bring your tools along with you.

Best regards,
Program Coordinator
Sri Sathya Sai Skill Development Program
🌐 [www.sethu.ai](http://www.sethu.ai)
📞 9052372023`,
        };
        const filePath = path.join(
          __dirname,
          "../sethu.ai-nodejs-backend/public/broucher.pdf"
        );
        resendMail(student, message, filePath);
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

        let message = {
          subject: `Invitation to Interview for Sri Sathya Sai Skill Development Program on ${moment(
            int_datetime
          ).format("LL")}`,

          text: `Dear ${student.name},
We are pleased to inform you that you have successfully cleared the written test and have been shortlisted for the next step in the selection process – the Interview for the Sri Sathya Sai Skill Development Program.

Please find the interview details below:

📅 Date: ${moment(int_datetime).format("LL")}
⏰ Time: ${moment(int_datetime).format("LT")}
📍 Location: Khairatabad, opposite lane to Shadan College, Near Khairatabad Metro Station
🔗 Venue: https://goo.gl/maps/pLyUu3RZ5nhutjcf9

The interview will focus on assessing your technical knowledge, problem-solving skills, and overall suitability for the program.

Kindly reply to this email to confirm your participation. We look forward to meeting you and discussing your potential journey with us!


Best regards,
Program Coordinator
Sri Sathya Sai Skill Development Program
🌐 [www.sethu.ai](http://www.sethu.ai)
📞 9052372023`,
        };

        resendMail(student, message);
      }
    }

    if (current_state == CURRENT_STATE.REJECTED) {
      updates.current_state = CURRENT_STATE.REJECTED;

      {
        let message = {
          subject: `Update on Your Application for the Sri Sathya Sai Skill Development Course`,

          text: `Dear ${student.name},
Thank you for applying for the Sri Sathya Sai Skill Development Course. We truly appreciate your effort and enthusiasm in taking this step toward skill development.

After careful consideration, we regret to inform you that we are unable to offer you a place in this batch of the program. However, we encourage you to continue pursuing your learning journey, as there will be more opportunities in the future.

We appreciate your interest and encourage you to apply again in upcoming sessions. Wishing you success in all your endeavors!

Regards,
Program Coordinator
for Sri Sathya Sai Skill Development Project
🌐 [www.sethu.ai](http://www.sethu.ai)
📞 9052372023`,
        };

        // sendEmails(student, message);
        resendMail(student, message);
      }
    } else {
      updates.current_state = current_state;
    }

    if (account_id && account_id != undefined) {
      updates.account_id = account_id;
      updates.acc_id = req.user.id;

      if (student.account_id == null) {
        let reviewerdata = await accountModel.findOne({
          where: {
            account_id,
          },
        });

        let message = {
          subject: `New Student Assigned for Review`,

          text: `Dear ${reviewerdata.name},
You have been assigned a student for review in the Sri Sathya Sai Skill Development Program. Please find the details below:

👤 Student Name: ${student.name}

Please review their progress and provide your feedback accordingly. If you have any questions, feel free to reach out.

Best regards,
Program Coordinator
Sri Sathya Sai Skill Development Program
🌐 [www.sethu.ai](http://www.sethu.ai)
📞 9052372023`,
        };
        resendMail(reviewerdata, message);
      }
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

          {
            let message = {
              subject: `Congratulations! You are Selected for Sri Sathya Sai Skill Development FREE Data Engineer Course`,

              text: `Dear ${student.name},
We are thrilled to announce that you have been selected for the Sri Sathya Sai Skill Development Course! Your journey towards enhancing your skills and employability begins now.

Details regarding the Online Orientation Meeting and In-Person Course Start Date will be shared with you in the upcoming emails. Please stay tuned for further communication.

We look forward to having you on this learning journey. Get ready to make the most of this opportunity!

Congratulations once again!

Regards,
Program Coordinator
for Sri Sathya Sai Skill Development Project
🌐 [www.sethu.ai](http://www.sethu.ai)
📞 9052372023`,
            };

            // sendEmails(student, message);
            resendMail(student, message);
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
