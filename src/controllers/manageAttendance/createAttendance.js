import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";

import initattendanceItm from "../../models/attendanceitmModel.js";
import authenticate from "../../middlewares/authenticate.js";
import initAttendanceModel from "../../models/attendanceModel.js";

const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    // if (req.user.role != ROLE.ADMIN) {
    //   return send(res, RESPONSE.ACCESS_DENIED);
    // }

    let { attendance_type, attendance_status, student_id, batch_id } = req.body;

    let attendanceItmModel = await initattendanceItm();
    let attendanceModel = await initAttendanceModel();

    if (attendance_type == "" || attendance_type == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "attendance_type"));
    }
    if (attendance_status == "" || attendance_status == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "attendance_status"));
    }
    if (student_id == "" || student_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "student_id"));
    }
    if (batch_id == "" || batch_id == undefined) {
      return send(res, setErrResMsg(RESPONSE.REQUIRED, "batch_id"));
    }

    if (!Array.isArray(student_id)) {
      student_id = [student_id];
    }
    if (!Array.isArray(attendance_status)) {
      attendance_status = [attendance_status];
    }
    const date = Date.now();


if (student_id.length == attendance_status.length) {
  let attendance = await attendanceModel.create({
    attendance_type,
    datetime: date,
    batch_id,
    account_id: req.user.id,
  });
  for (let i = 0; i < student_id.length; i++) {
    await attendanceItmModel.create({
      student_id: student_id[i],
      attendance_status:attendance_status[i],
      attendance_id: attendance.attendance_id,
      datetime: date,
    });
  }

  return send(res, RESPONSE.SUCCESS);
}else{
  return send(res,setErrResMsg( RESPONSE.ERR,"Some fields are missing"));

}


  } catch (err) {
    console.log("create attendance", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
