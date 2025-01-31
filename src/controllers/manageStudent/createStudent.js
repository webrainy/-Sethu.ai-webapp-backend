import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import {
  CURRENT_STATE,
  HASH_ROUND,
  ROLE,
  STATE,
} from "../../config/constants.js";
import image from "../../middlewares/uploads.js";
import bcrypt from "bcrypt";
import { deletefile } from "../../middlewares/deleteFile.js";
import authenticate from "../../middlewares/authenticate.js";
import initstudentmodel from "../../models/studentModel.js";
import initadminmodel from "../../models/adminModel.js";

const imagedir = "document/";
const uploads = image(imagedir).fields([
  { name: "resume", maxCount: 1 },
  { name: "coverletter", maxCount: 1 },
]);
const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    uploads(req, res, async (err) => {
      if (req.files) {
        if (err) {
          return send(res, setErrResMsg(RESPONSE.MULTER_ERROR, err.message));
        }
        if (!req.files.resume) {
          return send(res, setErrResMsg(RESPONSE.REQUIRED, "Resume"));
        }
        if (!req.files.coverletter) {
          return send(res, setErrResMsg(RESPONSE.REQUIRED, "Cover letter"));
        }
      }

      const {
        name,
        phone,
        email,
        password,
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
      let resume = req.files.resume[0].filename;
      let coverletter = req.files.coverletter[0].filename;
      let studentModel = await initstudentmodel();
      let adminModel = await initadminmodel();

      if (name == "" || name == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "name"));
      }
      if (phone == "" || phone == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "phone"));
      }
      if (email == "" || email == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "email"));
      }
      if (password == "" || password == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "password"));
      }
      if (location == "" || location == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "location"));
      }
      if (education == "" || education == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "education"));
      }
      if (cgpa == "" || cgpa == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "cgpa"));
      }
      if (year_passed == "" || year_passed == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "year_passed"));
      }
      if (gmat == "" || gmat == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "gmat"));
      }
      if (course_prep == "" || course_prep == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "course_prep"));
      }
      if (curnt_work == "" || curnt_work == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "curnt_work"));
      }
      if (commit_ft == "" || commit_ft == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "commit_ft"));
      }
      if (sk_python == "" || sk_python == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_python"));
      }
      if (sk_sql == "" || sk_sql == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_sql"));
      }
      if (sk_java == "" || sk_java == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_java"));
      }
      if (sk_analyticalskill == "" || sk_analyticalskill == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_analyticalskill"));
      }
      if (sk_prblmsolving == "" || sk_prblmsolving == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_prblmsolving"));
      }
      if (sk_engprof == "" || sk_engprof == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_engprof"));
      }
      if (hckr_rnk == "" || hckr_rnk == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "hckr_rnk"));
      }
      if (hobbies == "" || hobbies == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "hobbies"));
      }
      if (linkedin_url == "" || linkedin_url == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "linkedin_url"));
      }
      if (github_url == "" || github_url == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "github_url"));
      }
      if (father_occ == "" || father_occ == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "father_occ"));
      }
      if (mother_occ == "" || mother_occ == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "mother_occ"));
      }
      if (income == "" || income == undefined) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "income"));
      }

      const emailPattern = String(email).match(
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
      );

      if (!emailPattern) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.INVALID, "Email"));
      }

      const pPattern = String(phone).match(/^\+\d{10,15}$/);
      if (!pPattern) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.INVALID, "Phone"));
      }

      const pwdPattern = String(password).match(
        /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{6,32}$/
      );
      if (!pwdPattern) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(res, setErrResMsg(RESPONSE.INVALID, "password pattern"));
      }

      let isadminPhone = await adminModel.findOne({
        where: {
          isactive: STATE.ACTIVE,
          phone,
        },
      });

      let isadminEmail = await adminModel.findOne({
        where: {
          isactive: STATE.ACTIVE,
          email,
        },
      });

      let isphoneExist = await studentModel.findOne({
        where: {
          isactive: STATE.ACTIVE,
          phone,
        },
      });
      let isemailExist = await studentModel.findOne({
        where: {
          isactive: STATE.ACTIVE,
          email,
        },
      });

      if (isphoneExist || isadminPhone) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(
          res,
          setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this phone")
        );
      }
      if (isemailExist || isadminEmail) {
        deletefile(`public/${imagedir}`, [resume, coverletter]);
        return send(
          res,
          setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this email")
        );
      }

      const encryptedPassword = await bcrypt.hash(password, HASH_ROUND);

      await studentModel.create({
        ...req.body,
        current_state: CURRENT_STATE.IN_PROGRESS,
        role: ROLE.STUDENT,
        password: encryptedPassword,
        resume,
        coverletter,
      });

      return send(res, RESPONSE.SUCCESS);
    });
  } catch (err) {
    console.log("create student", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
