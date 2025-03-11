import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { ROLE, STATE } from "../../config/constants.js";
import initaccountModel from "../../models/accountModel.js";
import initstudentmodel from "../../models/studentModel.js";
import initexamModel from "../../models/examModel.js";
import initinterviewModel from "../../models/interviewModel.js";
import CryptoJS from "crypto-js";
import { Op } from "sequelize";
import initbatchModel from "../../models/batchModel.js";
import moment from "moment";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    const accountModel = await initaccountModel();
    const studentModel = await initstudentmodel();
    const examModel = await initexamModel();
    const interviewModel = await initinterviewModel();
    const batchModel = await initbatchModel();

    let studentAttribute = [];
    let stAttribute = [
      "student_id",
      "name",
      "phone",
      "email",
      "rollno",
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
      "createdAt",
    ];
    let batchAttribute = [];
    let examAttribute = [];
    let interviewAttribute = [];
    let studentQuery = {};
    req.query.searchkey
      ? (studentQuery.name = { [Op.iLike]: `%${req.query.searchkey}%` })
      : "";

    let query = {
      isactive: STATE.ACTIVE,
      role: ROLE.REVIEWER,
    };

    if (req.user.role == ROLE.REVIEWER) {
      query.account_id = req.user.id;
      studentAttribute = stAttribute;
      batchAttribute = [
        "batch_id",
        "name",
        "start_date",
        "end_date",
        "technologies",
        "tutor",
        "lab_coordinator",
        "planned_hour",
        "actual_hour",
      ];
      examAttribute = ["exam_id", "exam_datetime", "exam_result", "exam_marks"];
      interviewAttribute = ["interview_id", "int_datetime", "int_result"];
    } else if (req.query.account_id) {
      query.account_id = req.query.account_id;
      studentAttribute = stAttribute;
      batchAttribute = [
        "batch_id",
        "name",
        "start_date",
        "end_date",
        "technologies",
        "tutor",
        "lab_coordinator",
        "planned_hour",
        "actual_hour",
      ];
      examAttribute = ["exam_id", "exam_datetime", "exam_result", "exam_marks"];
      interviewAttribute = ["interview_id", "int_datetime", "int_result"];
    }

    let reviewerData = await accountModel.findAll({
      where: query,
      attributes: [
        "account_id",
        "name",
        "phone",
        "email",
        "password",
        "account",
      ],
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: accountModel,
          as: "createdBy",
          attributes: ["account_id", "name", "phone", "email", "role"],
          required: false,
        },
        {
          model: studentModel,
          as: "studentInfo",
          attributes: studentAttribute,
          where: studentQuery,
          required: false,
          include: [
            {
              model: batchModel,
              as: "batchInfo",
              attributes: batchAttribute,
              required: false,
            },
            {
              model: examModel,
              as: "examInfo",
              attributes: examAttribute,
              required: false,
            },
            {
              model: interviewModel,
              as: "interviewInfo",
              attributes: interviewAttribute,
              required: false,
            },
          ],
        },
      ],
    });

    if (reviewerData.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "reviewer data"));
    }

    reviewerData = reviewerData.map((itm) => {
      const bytes = CryptoJS.AES.decrypt(itm.password, process.env.TOKEN_KEY);
      const decryptPassword = bytes.toString(CryptoJS.enc.Utf8);
      // return {
      //   ...itm.toJSON(),
      //   password: decryptPassword,
      //   studentInfo: itm?.studentInfo?.map((std) => ({
      //     ...std.toJSON(),
      //     resume: "/document/" + std.resume,
      //     profile: std.profile ? "/document/" + std.profile : null,
      //     registered_on: std.registered_on
      //       ? moment
      //           .utc(std.registered_on)
      //           .tz("Europe/Berlin")
      //           .format("YYYY-MM-DD HH:mm:ss")
      //       : null,
      //     selected_on: std.selected_on
      //       ? moment
      //           .utc(std.selected_on)
      //           .tz("Europe/Berlin")
      //           .format("YYYY-MM-DD HH:mm:ss")
      //       : null,
      //     createdAt: std.createdAt
      //       ? moment
      //           .utc(std.createdAt)
      //           .tz("Europe/Berlin")
      //           .format("YYYY-MM-DD HH:mm:ss")
      //       : null,
      //     batchInfo: {
      //       ...std.batchInfo?.toJSON(),
      //       start_date:
      //         std.batchInfo?.start_date != null
      //           ? moment
      //               .utc(std.batchInfo.start_date)
      //               .tz("Europe/Berlin")
      //               .format("YYYY-MM-DD HH:mm:ss")
      //           : null,
      //       end_date:
      //         std.batchInfo?.end_date != null
      //           ? moment
      //               .utc(std.batchInfo.end_date)
      //               .tz("Europe/Berlin")
      //               .format("YYYY-MM-DD HH:mm:ss")
      //           : null,
      //     },

      //     examInfo: std.examInfo.map((exm) => ({
      //       ...exm.toJSON(),
      //       exam_datetime: exm.exam_datetime
      //         ? moment
      //             .utc(exm.exam_datetime)
      //             .tz("Europe/Berlin")
      //             .format("YYYY-MM-DD HH:mm:ss")
      //         : null,
      //     })),
      //     interviewInfo: std.interviewInfo.map((int) => ({
      //       ...int.toJSON(),
      //       int_datetime: int.int_datetime
      //         ? moment
      //             .utc(int.int_datetime)
      //             .tz("Europe/Berlin")
      //             .format("YYYY-MM-DD HH:mm:ss")
      //         : null,
      //     })),
      //   })),
      // };
      return {
        ...itm.toJSON(),
        password: decryptPassword,
        studentInfo: itm?.studentInfo?.map((std) => ({
          ...std.toJSON(),
          resume: "/document/" + std.resume,
          profile: std.profile ? "/document/" + std.profile : null,
          registered_on: std.registered_on
            ? moment
                .utc(std.registered_on)
                .tz("Asia/Kolkata")
                .format("YYYY-MM-DD HH:mm:ss")
            : null,
          selected_on: std.selected_on
            ? moment
                .utc(std.selected_on)
                .tz("Asia/Kolkata")
                .format("YYYY-MM-DD HH:mm:ss")
            : null,
          createdAt: std.createdAt
            ? moment
                .utc(std.createdAt)
                .tz("Asia/Kolkata")
                .format("YYYY-MM-DD HH:mm:ss")
            : null,
          batchInfo: {
            ...std.batchInfo?.toJSON(),
            start_date:
              std.batchInfo?.start_date != null
                ? moment(std.batchInfo.start_date).format("YYYY-MM-DD HH:mm:ss")
                : null,
            end_date:
              std.batchInfo?.end_date != null
                ? moment(std.batchInfo.end_date).format("YYYY-MM-DD HH:mm:ss")
                : null,
          },

          examInfo: std.examInfo.map((exm) => ({
            ...exm.toJSON(),
            exam_datetime: exm.exam_datetime
              ? moment(exm.exam_datetime).format("YYYY-MM-DD HH:mm:ss")
              : null,
          })),
          interviewInfo: std.interviewInfo.map((int) => ({
            ...int.toJSON(),
            int_datetime: int.int_datetime
              ? moment(int.int_datetime).format("YYYY-MM-DD HH:mm:ss")
              : null,
          })),
        })),
      };
    });

    return send(res, RESPONSE.SUCCESS, reviewerData);
  } catch (error) {
    console.log("List reviewer", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
