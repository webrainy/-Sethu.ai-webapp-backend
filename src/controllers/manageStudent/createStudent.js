import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import {
  CURRENT_STATE,
  DNC_STATE,
  HASH_ROUND,
  ROLE,
  STATE,
} from "../../config/constants.js";
import image from "../../middlewares/uploads.js";
import bcrypt from "bcrypt";
import { deletefile } from "../../middlewares/deleteFile.js";
import authenticate from "../../middlewares/authenticate.js";
import initstudentmodel from "../../models/studentModel.js";
import initaccountmodel from "../../models/accountModel.js";
import { sendEmails } from "../../middlewares/emailMessage.js";

const imagedir = "document/";
const uploads = image(imagedir).fields([
  { name: "resume", maxCount: 1 },
  { name: "profile", maxCount: 1 },
]);
const router = Router();

export default router.post("/", authenticate, async (req, res) => {
  try {
    if (req.user.role != ROLE.ADMIN) {
      return send(res, RESPONSE.ACCESS_DENIED);
    }

    uploads(req, res, async (err) => {
      if (req.files != undefined) {
        if (err) {
          return send(res, setErrResMsg(RESPONSE.MULTER_ERROR, err.message));
        }
        // if (!req.files.profile) {
        //   return send(res, setErrResMsg(RESPONSE.REQUIRED, "Profile"));
        // }

        if (!req.files.resume || !req.files.resume == undefined) {
          return send(res, setErrResMsg(RESPONSE.REQUIRED, "Resume"));
        }
        // if (!req.files.coverletter) {
        //   return send(res, setErrResMsg(RESPONSE.REQUIRED, "Cover letter"));
        // }
      } else {
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "Resume"));
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
      // let coverletter = req.files.coverletter[0].filename;
      let profile = req.files.profile ? req.files.profile[0].filename : null;

      let studentModel = await initstudentmodel();
      let accountModel = await initaccountmodel();

      if (name == "" || name == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "name"));
      }
      if (phone == "" || phone == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "phone"));
      }
      if (email == "" || email == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "email"));
      }
      if (password == "" || password == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "password"));
      }
      if (location == "" || location == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "location"));
      }
      if (education == "" || education == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "education"));
      }
      if (cgpa == "" || cgpa == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "cgpa"));
      }
      if (year_passed == "" || year_passed == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "year_passed"));
      }
      if (gmat == "" || gmat == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "gmat"));
      }
      if (course_prep == "" || course_prep == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "course_prep"));
      }
      if (curnt_work == "" || curnt_work == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "curnt_work"));
      }
      if (commit_ft == "" || commit_ft == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "commit_ft"));
      }
      if (sk_python == "" || sk_python == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_python"));
      }
      if (sk_sql == "" || sk_sql == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_sql"));
      }
      if (sk_java == "" || sk_java == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_java"));
      }
      if (sk_analyticalskill == "" || sk_analyticalskill == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_analyticalskill"));
      }
      if (sk_prblmsolving == "" || sk_prblmsolving == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_prblmsolving"));
      }
      if (sk_engprof == "" || sk_engprof == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_engprof"));
      }
      if (hckr_rnk == "" || hckr_rnk == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "hckr_rnk"));
      }
      if (hobbies == "" || hobbies == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "hobbies"));
      }
      if (linkedin_url == "" || linkedin_url == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "linkedin_url"));
      }
      if (github_url == "" || github_url == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "github_url"));
      }
      if (father_occ == "" || father_occ == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "father_occ"));
      }
      if (mother_occ == "" || mother_occ == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "mother_occ"));
      }
      if (income == "" || income == undefined) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "income"));
      }

      const emailPattern = String(email).match(
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
      );

      if (!emailPattern) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.INVALID, "Email"));
      }

      const pPattern = String(phone).match(/^\+\d{10,15}$/);
      if (!pPattern) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.INVALID, "Phone"));
      }

      const pwdPattern = String(password).match(
        /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{6,32}$/
      );
      if (!pwdPattern) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(res, setErrResMsg(RESPONSE.INVALID, "password pattern"));
      }

      let isaccountPhone = await accountModel.findOne({
        where: {
          isactive: STATE.ACTIVE,
          phone,
        },
      });

      let isaccountEmail = await accountModel.findOne({
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

      if (isphoneExist || isaccountPhone) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(
          res,
          setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this phone")
        );
      }

      if (isemailExist || isaccountEmail) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(
          res,
          setErrResMsg(RESPONSE.ALRDY_EXIST, "Entry with this email")
        );
      }

      const encryptedPassword = await bcrypt.hash(password, HASH_ROUND);

      let student = await studentModel.create({
        ...req.body,
        current_state: CURRENT_STATE.NOT_STARTED,
        role: ROLE.STUDENT,
        dnc_state: DNC_STATE.CALL,
        password: encryptedPassword,
        resume,
        profile,
        registered_on: Date.now(),
      });

      //       let message = {
      //         subject: `🎉 Welcome to Python Training – Let’s Begin!`,

      //         text: `Dear ${student.name},

      // Welcome aboard! 🚀 We are thrilled to have you in our **Python Training Course**. Get ready to embark on a journey where you will master Python, from basics to advanced concepts.

      // ### What’s Next?
      // ✅ Interactive live sessions
      // ✅ Hands-on coding exercises
      // ✅ Expert mentorship

      // Stay tuned for your **login credentials** in the next email.

      // If you have any questions, feel free to reach out.

      // Happy Coding! 👨‍💻🐍

      // Best Regards,
      // Your Instructor`,
      //       };

      //       sendEmails(student, message);

      //       let message2 = {
      //         subject: `🔑 Your Python Training Login Credentials`,

      //         text: `Dear ${student.name},

      // Welcome again to our **Python Training Course!** Below are your login credentials:

      // 🔹 **Portal Link:** http://103.212.120.217:5933/login
      // 🔹 **Username:** ${email}
      // 🔹 **Password:** ${password}

      // See you in class! 🚀

      // Best Regards,
      // Your Instructor`,
      //       };
      //       sendEmails(student, message2);

      return send(res, RESPONSE.SUCCESS);
    });
  } catch (err) {
    console.log("create student", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
