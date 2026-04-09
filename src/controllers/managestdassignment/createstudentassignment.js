// POST /api/student/assignment/create
import { Router } from "express";
import authenticate from "../../middlewares/authenticate.js";
import { ROLE } from "../../config/constants.js";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import initstudentassignment from "../../models/studentassignment.js";
import initstudentmodel from "../../models/studentModel.js";
import initassignmentItmModel from "../../models/assignmentItm.js"; // ← ADD THIS
import image from "../../middlewares/uploads.js";

const imagedir = "assignments/";
const uploads = image(imagedir).fields([
  { name: "assignment_doc", maxCount: 50 },
]);
const route = Router();

export default route.post("/", authenticate, async (req, res) => {
  if (req.user.role != ROLE.STUDENT) {
    return send(res, RESPONSE.ACCESS_DENIED);
  }

  try {
    uploads(req, res, async (err) => {
      if (err) {
        return send(res, setErrResMsg(RESPONSE.MULTER_ERROR, err.message));
      }

      let { assignment_url, assignment_description, assign_id } =
        req.body || {}; // ← ADD assign_id

      let docs = req.files?.assignment_doc?.map((f) => f.filename) || [];

      let model = await initstudentassignment();
      let studentmodel = await initstudentmodel();
      let assignmentItmModel = await initassignmentItmModel(); // ← ADD THIS

      let student = await studentmodel.findOne({
        where: { student_id: req.user.id },
        attributes: ["student_id", "batch_id"],
      });

      if (!student) {
        return send(res, setErrResMsg(RESPONSE.NOT_FOUND, "Student"));
      }

      // Create the student submission
      await model.create({
        assignment_url,
        assignment_description,
        assignment_doc: docs,
        student_id: student.student_id,
        batch_id: student.batch_id,
        assign_id, // ← LINK to the assignment item
      });

      // ✅ Update compl_status to 2 (Completed) in assignment_itm
      if (assign_id) {
        await assignmentItmModel.update(
          {
            compl_status: 2,
            completed_at: new Date(),
          },
          {
            where: {
              assign_id: assign_id,
              student_id: student.student_id,
            },
          },
        );
      }

      return send(res, RESPONSE.SUCCESS);
    });
  } catch (error) {
    console.log("Create Student Assignment:", error);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
