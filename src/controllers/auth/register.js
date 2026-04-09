import { Router } from "express";
import { send, setErrResMsg } from "../../helper/responseHelper.js";
import { RESPONSE } from "../../config/global.js";
import {
  CURRENT_STATE,
  DNC_STATE,
  HASH_ROUND,
  GOT_TO_KNOW_FROM,
  ROLE,
  STATE,
} from "../../config/constants.js";
import image from "../../middlewares/uploads.js";
import CryptoJS from "crypto-js";
import { deletefile } from "../../middlewares/deleteFile.js";
import initstudentmodel from "../../models/studentModel.js";
import initaccountmodel from "../../models/accountModel.js";
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
      if (err) {
        return send(res, setErrResMsg(RESPONSE.MULTER_ERROR, err.message));
      }

      const {
        name,
        phone,
        email,
        password,
        dob,
        gender,
        college,
        location,
        city,
        district,
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
        iq_level,
        attitude,
        aspiration,
        has_laptop,
        got_to_know_from,
        referedby,
      } = req.body;

      let resume = req.files.resume ? req.files.resume[0].filename : null;
      let profile = req.files.profile ? req.files.profile[0].filename : null;
      let studentModel = await initstudentmodel();
      let accountModel = await initaccountmodel();

      // helper to clean up files on error
      const cleanup = () => {
        if (req.files.profile) {
          deletefile(`public/${imagedir}`, [resume, profile]);
        }
      };

      if (!name) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "name"));
      }
      if (!phone) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "phone"));
      }
      if (!email) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "email"));
      }
      if (!password) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "password"));
      }
      if (!dob) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "dob"));
      }
      if (!gender) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "gender"));
      }
      if (!college) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "college"));
      }
      if (!city) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "city"));
      }
      if (!district) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "district"));
      }
      if (!education) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "education"));
      }
      if (!cgpa) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "cgpa"));
      }
      if (!year_passed) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "year_passed"));
      }
      if (!gmat) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "gmat"));
      }
      if (!course_prep) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "course_prep"));
      }
      if (!curnt_work) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "curnt_work"));
      }
      if (!commit_ft) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "commit_ft"));
      }
      if (!sk_python) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_python"));
      }
      if (!sk_sql) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_sql"));
      }
      if (!sk_java) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_java"));
      }
      if (!sk_analyticalskill) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_analyticalskill"));
      }
      if (!sk_prblmsolving) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_prblmsolving"));
      }
      if (!sk_engprof) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "sk_engprof"));
      }
      if (!hckr_rnk) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "hckr_rnk"));
      }
      if (!hobbies) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "hobbies"));
      }
      if (!father_occ) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "father_occ"));
      }
      if (!mother_occ) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "mother_occ"));
      }
      if (!income) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "income"));
      }

      // got_to_know_from validation
      if (!got_to_know_from) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "got_to_know_from"));
      }

      // if Referral selected, referedby is mandatory
      if (got_to_know_from === GOT_TO_KNOW_FROM.REFERRAL && !referedby) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.REQUIRED, "referedby"));
      }

      const emailPattern = String(email).match(
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      );
      if (!emailPattern) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.INVALID, "Email"));
      }

      const pPattern = String(phone).match(/^\+\d{10,15}$/);
      if (!pPattern) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.INVALID, "Phone"));
      }

      const pwdPattern = String(password).match(
        /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{6,32}$/,
      );
      if (!pwdPattern) {
        cleanup();
        return send(res, setErrResMsg(RESPONSE.INVALID, "password pattern"));
      }

      let isaccountPhone = await accountModel.findOne({
        where: { isactive: STATE.ACTIVE, phone },
      });
      let isaccountEmail = await accountModel.findOne({
        where: { isactive: STATE.ACTIVE, email },
      });
      let isphoneExist = await studentModel.findOne({
        where: { isactive: STATE.ACTIVE, phone },
      });
      let isemailExist = await studentModel.findOne({
        where: { isactive: STATE.ACTIVE, email },
      });

      if (isphoneExist || isaccountPhone) {
        cleanup();
        return send(
          res,
          setErrResMsg(
            RESPONSE.ERR,
            "You are already registered with us. Please call us at the phone number on home page",
          ),
        );
      }
      if (isemailExist || isaccountEmail) {
        cleanup();
        return send(
          res,
          setErrResMsg(
            RESPONSE.ERR,
            "You are already registered with us. Please call us at the phone number on home page",
          ),
        );
      }

      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        process.env.TOKEN_KEY,
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

      resendMail(student, message);
      return send(res, RESPONSE.SUCCESS);
    });
  } catch (err) {
    console.log("register", err);
    return send(res, RESPONSE.UNKNOWN_ERROR);
  }
});
