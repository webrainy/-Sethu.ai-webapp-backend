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
// import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import { deletefile } from "../../middlewares/deleteFile.js";
import initstudentmodel from "../../models/studentModel.js";
import initaccountmodel from "../../models/accountModel.js";
// import { sendEmails } from "../../middlewares/emailMessage.js";
import { resendMail } from "../../middlewares/resend.js";

const imagedir = "document/";
const uploads = image(imagedir).fields([
  { name: "resume", maxCount: 1 },
  { name: "profile", maxCount: 1 },
]);
const router = Router();

export default router.post("/", async (req, res) => {
  try {
    uploads(req, res, async (err) => {
      if (req.files != undefined) {
        if (err) {
          return send(res, setErrResMsg(RESPONSE.MULTER_ERROR, err.message));
        }
        if (!req.files.resume || !req.files.resume == undefined) {
          return send(res, setErrResMsg(RESPONSE.REQUIRED, "Resume"));
        }
        // if (!req.files.profile || req.files.profile == undefined) {
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
          setErrResMsg(
            RESPONSE.ERR,
            "You are already registered with us. Please call us at the phone number on home page"
          )
        );
      }
      if (isemailExist || isaccountEmail) {
        deletefile(`public/${imagedir}`, [resume, profile]);
        return send(
          res,
          setErrResMsg(
            RESPONSE.ERR,
            "You are already registered with us. Please call us at the phone number on home page"
          )
        );
      }

      // const encryptedPassword = await bcrypt.hash(password, HASH_ROUND);

      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        process.env.TOKEN_KEY
      ).toString();

      let student = await studentModel.create({
        ...req.body,
        current_state: CURRENT_STATE.NOT_STARTED,
        role: ROLE.STUDENT,
        password: encryptedPassword,
        resume,
        profile,
        registered_on: Date.now(),
        dnc_state: DNC_STATE.CALL,
      });

      let message = {
        subject: `Confirmation of Interest in Data Engineer Course`,

        text: `Dear ${student.name},
We are pleased to acknowledge your registration for the Data Engineer Course offered by the Sri Sathya Sai Skill Development Program.
        
This comprehensive, in-person, three-month course is tailored for graduates or postgraduates with a keen interest in technology. The course is conducted by industry experts and is designed to equip participants with the necessary skills for a successful career in data engineering. Upon successful completion, participants will receive placement recommendations. This program is offered entirely free of charge as part of our commitment to nation-building.
        
As the next step, you will be invited to an examination and interview to confirm your enrollment. Please monitor your email and mobile phone for further communication regarding the details.
        
Please note that this is a system-generated email; do not reply to this message. Additionally, your application does not guarantee admission to the course.
        
We trust that you have provided the correct contact information to ensure seamless communication.
        
We wish you the very best in your endeavors.
        
Best regards,
Program Coordinator
Sri Sathya Sai Skill Development Program
🌐 [www.sethu.ai](http://www.sethu.ai)
📞 9052372023`,
      };

      // sendEmails(student, message);
      resendMail(student, message);

      return send(res, RESPONSE.SUCCESS);
    });
  } catch (err) {
    console.log("register", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
