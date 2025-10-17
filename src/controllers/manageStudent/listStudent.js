import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import initstudentModel from "../../models/studentModel.js";
import {
  ASSIGNED_STATUS,
  BATCH_STATE,
  CURRENT_STATE,
  RESULT,
  ROLE,
  STATE,
} from "../../config/constants.js";

import initbatchModel from "../../models/batchModel.js";
import { Op } from "sequelize";
import initaccountModel from "../../models/accountModel.js";
import initinterviewModel from "../../models/interviewModel.js";
import initexamModel from "../../models/examModel.js";
import moment from "moment";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    let query = {
      isactive: STATE.ACTIVE,
    };
    let batchQuery = {
      isactive: STATE.ACTIVE,
    };
    let reviewerQuery = {
      isactive: STATE.ACTIVE,
    };
    // let examQuery = {
    //   isactive: STATE.ACTIVE,
    // };

    if (req.user.role == ROLE.STUDENT) {
      query.student_id = req.user.id;
    } else {
      req.query.student_id ? (query.student_id = req.query.student_id) : "";
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const studentModel = await initstudentModel();
    const batchModel = await initbatchModel();
    const accountModel = await initaccountModel();
    const interviewModel = await initinterviewModel();
    const examModel = await initexamModel();

    req.query.searchkey
      ? (query.name = {
          [Op.iLike]: `%${req.query.searchkey}%`,
        })
      : "";

    // req.query.batch_name
    //   ? (batchQuery.name = {
    //       [Op.iLike]: `%${req.query.batch_name}%`,
    //     })
    //   : "";

    // req.query.batch_state
    //   ? (query.batch_state = Number(req.query.batch_state))
    //   : "";

    if (req.query.batch_state) {
      if (req.query.batch_state == BATCH_STATE.ASSIGNED) {
        req.query.batch_id
          ? (query.batch_id = req.query.batch_id)
          : (query.batch_id = { [Op.ne]: null });
      } else if (req.query.batch_state == BATCH_STATE.NOT_ASSIGNED) {
        query.batch_id = { [Op.eq]: null };
      }
    }

    //batch_id is mandatory while using this api as search inside batch
    req.query.batch_id ? (query.batch_id = req.query.batch_id) : "";

    if (req.query.reviewer_state) {
      if (req.query.reviewer_state == ASSIGNED_STATUS.ASSIGNED) {
        req.query.account_id
          ? (query.account_id = req.query.account_id)
          : (query.account_id = { [Op.ne]: null });
      } else if (req.query.reviewer_state == ASSIGNED_STATUS.UNASSIGNED) {
        query.account_id = { [Op.eq]: null };
      }
    }
    let includeExam = {
      model: examModel,
      as: "examInfo",
      attributes: ["exam_id", "exam_datetime", "exam_result", "exam_marks"],
      required: false, // default, overridden if needed
      where: { isactive: STATE.ACTIVE },
    };

    if (req.query.current_state) {
      if (req.query.current_state == CURRENT_STATE.ASSIGNED) {
        query.batch_id = { [Op.ne]: null };
      } else if (req.query.current_state == CURRENT_STATE.EXAM_SCHEDULED) {
        includeExam.required = true;
        includeExam.where = {
          exam_datetime: { [Op.ne]: null },
          exam_result: RESULT.PENDING,
        };
      } else if (req.query.current_state == CURRENT_STATE.EXAM_PASSED) {
        includeExam.required = true;
        includeExam.where = { exam_result: RESULT.PASS };
      } else {
        req.query.current_state
          ? (query.current_state = req.query.current_state)
          : "";
      }
    }

    let studentData = await studentModel.findAll({
      include: [
        {
          model: batchModel,
          as: "batchInfo",
          where: batchQuery,
          attributes: [
            "batch_id",
            "name",
            "start_date",
            "end_date",
            "technologies",
            "tutor",
            "lab_coordinator",
            "planned_hour",
            "actual_hour",
          ],
          required: false,
        },

        includeExam,
        {
          model: interviewModel,
          as: "interviewInfo",
          attributes: [
            "interview_id",
            "int_datetime",
            "int_result",
            "int_comment",
          ],
          required: false,
          include: [
            {
              model: accountModel,
              as: "interviewer",
              attributes: ["account_id", "name", "phone", "email"],
              required: false,
            },
          ],
        },
        {
          model: accountModel,
          as: "reviewerInfo",
          where: reviewerQuery,
          attributes: ["account_id", "name", "phone", "email"],
          required: false,
        },
        {
          model: accountModel,
          as: "assignedBy",
          attributes: ["account_id", "name", "phone", "email"],
          required: false,
        },
      ],
      where: query,
      attributes: [
        "student_id",
        "name",
        "phone",
        "email",
        "rollno",
        "rollno",
        "dob",
        "gender",
        "college",
        "location",
        "city",
        "district",
        "location",
        "education",
        "cgpa",
        "year_passed",
        "gmat",
        "course_prep",
        "curnt_work",
        "commit_ft",
        "sk_python",
        "sk_sql",
        "sk_java",
        "sk_analyticalskill",
        "sk_prblmsolving",
        "sk_engprof",
        "hckr_rnk",
        "hobbies",
        "linkedin_url",
        "github_url",
        "resume",
        "father_occ",
        "mother_occ",
        "income",
        "profile",
        "comment",
        "current_state",
        "batch_state",
        "dnc_state",
        "registered_on",
        "selected_on",
        "iq_level",
        "attitude",
        "aspiration",
        "has_laptop",
        "got_to_know_from",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      offset: skip,
      limit: limit,
    });

    if (studentData.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "student data"));
    }

    {
      // studentData = studentData.map((itm) => {
      //   return {
      //     ...itm.toJSON(),
      //     resume: "/document/" + itm.resume,
      //     profile: "/document/" + itm.profile,
      //     registered_on: itm.registered_on
      //       ? moment
      //           .utc(itm.registered_on)
      //           .tz("Europe/Berlin")
      //           .format("YYYY-MM-DD HH:mm:ss")
      //       : null,
      //     selected_on: itm.selected_on
      //       ? moment
      //           .utc(itm.selected_on)
      //           .tz("Europe/Berlin")
      //           .format("YYYY-MM-DD HH:mm:ss")
      //       : null,
      //     createdAt: itm.createdAt
      //       ? moment
      //           .utc(itm.createdAt)
      //           .tz("Europe/Berlin")
      //           .format("YYYY-MM-DD HH:mm:ss")
      //       : null,
      //     batchInfo: {
      //       ...itm.batchInfo?.toJSON(),
      //       start_date:
      //         itm.batchInfo?.start_date != null
      //           ? moment
      //               .utc(itm.batchInfo.start_date)
      //               .tz("Europe/Berlin")
      //               .format("YYYY-MM-DD HH:mm:ss")
      //           : null,
      //       end_date:
      //         itm.batchInfo?.end_date != null
      //           ? moment
      //               .utc(itm.batchInfo.end_date)
      //               .tz("Europe/Berlin")
      //               .format("YYYY-MM-DD HH:mm:ss")
      //           : null,
      //     },
      //     examInfo: itm.examInfo.map((exm) => ({
      //       ...exm.toJSON(),
      //       exam_datetime: exm.exam_datetime
      //         ? moment
      //             .utc(exm.exam_datetime)
      //             .tz("Europe/Berlin")
      //             .format("YYYY-MM-DD HH:mm:ss")
      //         : null,
      //     })),
      //     interviewInfo: itm.interviewInfo.map((int) => ({
      //       ...int.toJSON(),
      //       int_datetime: int.int_datetime
      //         ? moment
      //             .utc(int.int_datetime)
      //             .tz("Europe/Berlin")
      //             .format("YYYY-MM-DD HH:mm:ss")
      //         : null,
      //     })),
      //   };
      // });
    }

    studentData = studentData.map((itm) => {
      return {
        ...itm.toJSON(),
        resume: itm.resume ? "/document/" + itm.resume : null,
        profile: itm.profile ? "/document/" + itm.profile : null,
        registered_on: itm.registered_on
          ? moment
              .utc(itm.registered_on)
              .tz("Asia/Kolkata")
              .format("YYYY-MM-DD HH:mm:ss")
          : null,
        selected_on: itm.selected_on
          ? moment
              .utc(itm.selected_on)
              .tz("Asia/Kolkata")
              .format("YYYY-MM-DD HH:mm:ss")
          : null,
        createdAt: itm.createdAt
          ? moment
              .utc(itm.createdAt)
              .tz("Asia/Kolkata")
              .format("YYYY-MM-DD HH:mm:ss")
          : null,
        batchInfo: {
          ...itm.batchInfo?.toJSON(),
          start_date:
            itm.batchInfo?.start_date != null
              ? moment(itm.batchInfo.start_date).format("YYYY-MM-DD HH:mm:ss")
              : null,
          end_date:
            itm.batchInfo?.end_date != null
              ? moment(itm.batchInfo.end_date).format("YYYY-MM-DD HH:mm:ss")
              : null,
        },
        examInfo: itm.examInfo.map((exm) => ({
          ...exm.toJSON(),
          exam_datetime: exm.exam_datetime
            ? moment(exm.exam_datetime).format("YYYY-MM-DD HH:mm:ss")
            : null,
        })),
        interviewInfo: itm.interviewInfo.map((int) => ({
          ...int.toJSON(),
          int_datetime: int.int_datetime
            ? moment(int.int_datetime).format("YYYY-MM-DD HH:mm:ss")
            : null,
        })),
      };
    });

    const totalCount = await studentModel.count({ where: query });

    return send(res, RESPONSE.SUCCESS, {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      studentData,
    });
  } catch (error) {
    console.log("List student", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
