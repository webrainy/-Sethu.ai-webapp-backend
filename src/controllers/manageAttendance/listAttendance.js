import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import initbatchModel from "../../models/batchModel.js";
import { ROLE, STATE } from "../../config/constants.js";
import initstudentmodel from "../../models/studentModel.js";
import moment from "moment";
import initaccountModel from "../../models/accountModel.js";
import initAttendanceModel from "../../models/attendanceModel.js";
import initattendanceItm from "../../models/attendanceitmModel.js";
import { Op } from "sequelize";
const router = Router();

export default router.get("/", authenticate, async (req, res) => {
  try {
    let batch_id = req.query.batch_id;
    let date = req.query.date;

    if (batch_id == "" || batch_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
    }

    let query = {
      isactive: STATE.ACTIVE,
      batch_id,
    };
    let itmQuery = {
      isactive: STATE.ACTIVE,
    };

    req.query.attendance_type != undefined
      ? (query.attendance_type = req.query.attendance_type)
      : "";

    req.query.attendance_status != undefined
      ? (itmQuery.attendance_status = req.query.attendance_status)
      : "";

    if (date) {
      let startOfDay = moment(date).startOf("day");
      let endOfDay = moment(date).endOf("day");
      query.datetime = {
        [Op.between]: [startOfDay, endOfDay],
      };
    }

    const studentModel = await initstudentmodel();
    const accountModel = await initaccountModel();
    const attendanceModel = await initAttendanceModel();
    const attendanceItmModel = await initattendanceItm();

    let batchAttendance = await attendanceModel.findAll({
      include: [
        {
          model: accountModel,
          as: "createdBy",
          attributes: ["account_id", "name", "phone", "email", "role"],
          required: false,
        },
        {
          model: attendanceItmModel,
          as: "attendanceInfo",
          where: itmQuery,
          attributes: ["att_id", "attendance_status"],
          include: [
            {
              model: studentModel,
              as: "studentInfo",
              attributes: [
                "student_id",
                "name",
                "phone",
                "email",
                "rollno",
                "current_state",
                "batch_state",
                "dnc_state",
                "registered_on",
                "selected_on",
              ],
            },
          ],
        },
      ],
      where: query,
      attributes: [
        "attendance_id",
        "datetime",
        "attendance_type",
        "createdAt",
        "batch_id",
      ],
      order: [["createdAt", "DESC"]],
      // limit: limit,
    });

    if (batchAttendance.length == 0) {
      return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "batch Attendance"));
    }

    return send(res, RESPONSE.SUCCESS, batchAttendance);
  } catch (error) {
    console.log("list batch Attendance", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
