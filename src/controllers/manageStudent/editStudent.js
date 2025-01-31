import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import { CURRENT_STATE, ROLE, STATE } from "../../config/constants.js";
import initstudentModel from "../../models/studentModel.js";
import authenticate from "../../middlewares/authenticate.js";
import { Op } from "sequelize";
import { deletefile } from "../../middlewares/deleteFile.js";
import initadminModel from "../../models/adminModel.js";
import image from "../../middlewares/uploads.js";
const imagedir = "document/";
const uploads = image(imagedir).fields([
  { name: "resume", maxCount: 1 },
  { name: "coverletter", maxCount: 1 },
]);
const router = Router();

export default router.put("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.STUDENT) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    uploads(req, res, async (err) => {
      let updates = {};
      let filename = [];
      if (req.files) {
        if (err) {
          return send(res, setErrResMsg(RESPONSE.MULTER_ERROR, err.stack));
        }
        if (req.files.resume != undefined && req.files.resume.length > 0) {
          updates.resume = req.files.resume[0].filename;
          filename.push(req.files.resume[0].filename);
        }
        if (
          req.files.coverletter != undefined &&
          req.files.coverletter.length > 0
        ) {
          updates.coverletter = req.files.coverletter[0].filename;
          filename.push(req.files.coverletter[0].filename);
        }
      }

      const student_id = req.user.id;
      const {
        name,
        phone,
        email,
        // password,
        location,
        education,
        cgpa,
        year_passed,
        gmat,
        course_prep,
        curnt_work,
        commit_ft,
        sk_python,
        sk_sql,
        sk_java,
        sk_analyticalskill,
        sk_prblmsolving,
        sk_engprof,
        hckr_rnk,
        hobbies,
        linkedin_url,
        github_url,
        father_occ,
        mother_occ,
        income,
      } = req.body;

      let studentModel = await initstudentModel();
      let adminModel = await initadminModel();

      if (name && name != undefined) {
        updates.name = name;
      }
      if (phone && phone != undefined) {
        const pPattern = String(phone).match(/^\+\d{10,15}$/);
        if (!pPattern) {
          deletefile(`public/${imagedir}`, filename);
          return send(res, setErrResMsg(RESPONSE.INVALID, "Phone"));
        }

        let isadminPhone = await adminModel.findOne({
          where: {
            isactive: STATE.ACTIVE,
            phone,
          },
        });

        let isphoneExist = await studentModel.findOne({
          where: {
            isactive: STATE.ACTIVE,
            student_id: { [Op.ne]: student_id },
            phone,
          },
        });

        if (isphoneExist && isadminPhone) {
          deletefile(`public/${imagedir}`, filename);

          return send(
            res,
            setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this phone")
          );
        } else {
          updates.phone = phone;
        }
      }
      if (email && email != undefined) {
        const emailPattern = String(email).match(
          /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
        );

        if (!emailPattern) {
          deletefile(`public/${imagedir}`, filename);
          return send(res, setErrResMsg(RESPONSE.INVALID, "Email"));
        }

        let isadminEmail = await adminModel.findOne({
          where: {
            isactive: STATE.ACTIVE,
            email,
          },
        });
        let isemailExist = await studentModel.findOne({
          where: {
            isactive: STATE.ACTIVE,
            student_id: { [Op.ne]: student_id },
            email,
          },
        });
        if (isemailExist && isadminEmail) {
          deletefile(`public/${imagedir}`, filename);
          return send(
            res,
            setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this email")
          );
        } else {
          updates.email = email;
        }
      }
      // if (password && password != undefined) {
      //   updates.password = password;
      // }
      if (location && location != undefined) {
        updates.location = location;
      }
      if (education && education != undefined) {
        updates.education = education;
      }
      if (cgpa && cgpa == "") {
        updates.cgpa = cgpa;
      }
      if (year_passed && year_passed != undefined) {
        updates.year_passed = year_passed;
      }
      if (gmat && gmat != undefined) {
        updates.gmat = gmat;
      }
      if (course_prep && course_prep != undefined) {
        updates.course_prep = course_prep;
      }
      if (curnt_work && curnt_work != undefined) {
        updates.curnt_work = curnt_work;
      }
      if (commit_ft && commit_ft != undefined) {
        updates.commit_ft = commit_ft;
      }
      if (sk_python && sk_python != undefined) {
        updates.sk_python = sk_python;
      }
      if (sk_sql && sk_sql != undefined) {
        updates.sk_sql = sk_sql;
      }
      if (sk_java && sk_java != undefined) {
        updates.sk_java = sk_java;
      }
      if (sk_analyticalskill && sk_analyticalskill != undefined) {
        updates.sk_analyticalskill = sk_analyticalskill;
      }
      if (sk_prblmsolving && sk_prblmsolving != undefined) {
        updates.sk_prblmsolving = sk_prblmsolving;
      }

      if (sk_engprof && sk_engprof != undefined) {
        updates.sk_engprof = sk_engprof;
      }
      if (hckr_rnk && hckr_rnk != undefined) {
        updates.hckr_rnk = hckr_rnk;
      }
      if (hobbies && hobbies != undefined) {
        updates.hobbies = hobbies;
      }
      if (linkedin_url && linkedin_url != undefined) {
        updates.linkedin_url = linkedin_url;
      }
      if (github_url && github_url != undefined) {
        updates.github_url = github_url;
      }

      if (father_occ && father_occ != undefined) {
        updates.father_occ = father_occ;
      }
      if (mother_occ && mother_occ != undefined) {
        updates.mother_occ = mother_occ;
      }
      if (income && income != undefined) {
        updates.income = income;
      }

      console.log(student_id);

    let x =  await studentModel.update(updates, {
        where: { student_id: student_id },
      });


      

      return send(res, RESPONSE.SUCCESS);
    });
  } catch (err) {
    console.log("edit student", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
