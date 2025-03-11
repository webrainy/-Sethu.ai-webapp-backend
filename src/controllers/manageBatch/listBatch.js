import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import initbatchModel from "../../models/batchModel.js";
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_TYPE,
  ROLE,
  STATE,
} from "../../config/constants.js";
import initstudentmodel from "../../models/studentModel.js";
import moment from "moment";
import initaccountModel from "../../models/accountModel.js";
import initAttendanceModel from "../../models/attendanceModel.js";
import initattendanceItm from "../../models/attendanceitmModel.js";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    // if (req.user.role != ROLE.ADMIN) {
    //   return send(res, RESPONSE.ACCESS_DENIED);
    // }

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
          "rollno",
          "comment",
          "education",
          "current_state",
          "batch_state",
          "dnc_state",
          "registered_on",
        ])
      : "";

    const batchModel = await initbatchModel();
    const studentModel = await initstudentmodel();
    const accountModel = await initaccountModel();

    let batchData = await batchModel.findAll({
      where: query,
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
        "comment",
      ],
      include: [
        {
          model: accountModel,
          as: "createdBy",
          attributes: ["account_id", "name", "phone", "email", "role"],
        },
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

    const attendanceModel = await initAttendanceModel();
    const attendanceItmModel = await initattendanceItm();

    let students;
    let attCount;
    let updatedBatchData = await Promise.all(
      batchData.map(async (itm) => {
        if (req.query.batch_id) {
          let classCount = await attendanceModel.count({
            where: {
              attendance_type: ATTENDANCE_TYPE.CLASS,
              isactive: STATE.ACTIVE,
              batch_id: req.query.batch_id,
            },
          });

          let labCount = await attendanceModel.count({
            where: {
              attendance_type: ATTENDANCE_TYPE.LAB,
              isactive: STATE.ACTIVE,
              batch_id: req.query.batch_id,
            },
          });

          let mentorshipCount = await attendanceModel.count({
            where: {
              attendance_type: ATTENDANCE_TYPE.MENTORSHIP,
              isactive: STATE.ACTIVE,
              batch_id: req.query.batch_id,
            },
          });
          attCount = {
            classCount,
            labCount,
            mentorshipCount,
          };

          students = await Promise.all(
            itm.students.map(async (std) => {
              let stdMentorshipCount = await attendanceModel.count({
                include: [
                  {
                    model: attendanceItmModel,
                    as: "attendanceInfo",
                    where: {
                      isactive: STATE.ACTIVE,
                      attendance_status: ATTENDANCE_STATUS.PRESENT,
                    },
                    include: [
                      {
                        model: studentModel,
                        as: "studentInfo",
                        where: {
                          isactive: STATE.ACTIVE,
                          student_id: std.student_id,
                        },
                      },
                    ],
                  },
                ],
                where: {
                  isactive: STATE.ACTIVE,
                  batch_id: req.query.batch_id,
                  attendance_type: ATTENDANCE_TYPE.MENTORSHIP,
                },
              });

              let stdLabCount = await attendanceModel.count({
                include: [
                  {
                    model: attendanceItmModel,
                    as: "attendanceInfo",
                    where: {
                      isactive: STATE.ACTIVE,
                      attendance_status: ATTENDANCE_STATUS.PRESENT,
                    },
                    include: [
                      {
                        model: studentModel,
                        as: "studentInfo",
                        where: {
                          isactive: STATE.ACTIVE,
                          student_id: std.student_id,
                        },
                      },
                    ],
                  },
                ],
                where: {
                  isactive: STATE.ACTIVE,
                  batch_id: req.query.batch_id,
                  attendance_type: ATTENDANCE_TYPE.LAB,
                },
              });

              let stdClassCount = await attendanceModel.count({
                include: [
                  {
                    model: attendanceItmModel,
                    as: "attendanceInfo",
                    where: {
                      isactive: STATE.ACTIVE,
                      attendance_status: ATTENDANCE_STATUS.PRESENT,
                    },
                    include: [
                      {
                        model: studentModel,
                        as: "studentInfo",
                        where: {
                          isactive: STATE.ACTIVE,
                          student_id: std.student_id,
                        },
                      },
                    ],
                  },
                ],
                where: {
                  isactive: STATE.ACTIVE,
                  batch_id: req.query.batch_id,
                  attendance_type: ATTENDANCE_TYPE.CLASS,
                },
              });
              return {
                ...std.toJSON(),
                mentorshipCount: stdMentorshipCount,
                classCount: stdClassCount,
                labCount: stdLabCount,
              };
            })
          );
        }

        return {
          attCount,
          ...itm.toJSON(),
          start_date:
            itm.start_date != null
              ? moment(itm.start_date).format("YYYY-MM-DD HH:mm:ss")
              : "",
          end_date:
            itm.end_date != null
              ? moment(itm.end_date).format("YYYY-MM-DD HH:mm:ss")
              : "",

          students,
        };
      })
    );

    // batchData.map((itm) => {
    //   return {
    //     ...itm.toJSON(),
    //     // start_date:
    //     //   itm.start_date != null
    //     //     ? moment
    //     //         .utc(itm.start_date)
    //     //         .tz("Europe/Berlin")
    //     //         .format("YYYY-MM-DD HH:mm:ss")
    //     //     : "",
    //     // end_date:
    //     //   itm.end_date != null
    //     //     ? moment
    //     //         .utc(itm.end_date)
    //     //         .tz("Europe/Berlin")
    //     //         .format("YYYY-MM-DD HH:mm:ss")
    //     //     : "",
    //     start_date:
    //       itm.start_date != null
    //         ? moment(itm.start_date).format("YYYY-MM-DD HH:mm:ss")
    //         : "",
    //     end_date:
    //       itm.end_date != null
    //         ? moment(itm.end_date).format("YYYY-MM-DD HH:mm:ss")
    //         : "",
    //   };
    // });

    // batchData.map((itm) => {
    //   return {
    //     ...itm.toJSON(),
    //     students: itm.students.map((std) => {
    //       return {
    //         ...std.toJSON(),
    //       };
    //     }),
    //     // start_date:
    //     //   itm.start_date != null
    //     //     ? moment(itm.start_date).format("YYYY-MM-DD HH:mm:ss")
    //     //     : "",
    //     // end_date:
    //     //   itm.end_date != null
    //     //     ? moment(itm.end_date).format("YYYY-MM-DD HH:mm:ss")
    //     //     : "",
    //   };
    // });

    return send(res, RESPONSE.SUCCESS, updatedBatchData);
  } catch (error) {
    console.log("list batch", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
