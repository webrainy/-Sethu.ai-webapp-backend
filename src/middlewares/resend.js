import { Resend } from "resend";
import fs from "fs";
import path from "path";
const __dirname = path.resolve();
const resend = new Resend("re_StstGuCa_Crhg2qi5QFpMJibmxH2CPuCV");

export const resendMail = async (student, msg, filePath) => {
  try {
    let messages = {
      to: student.email,
      from: process.env.RESEND_MAIL,
      subject: msg.subject,
      text: msg.text,
    };

    // let messages = {
    //   to: "demoapp24478@gmail.com",
    //   from: process.env.RESEND_MAIL,
    //   subject: "test",
    //   text: "ghsgsgsggsgsgsg",
    // };

    if (filePath != undefined) {
      const fileContent = filePath
        ? fs.readFileSync(filePath).toString("base64")
        : "";

      messages.attachments = [
        {
          filename: "broucher.pdf",
          content: fileContent,
        },
      ];
    }

    resend.emails.send(messages);
  } catch (error) {
    console.log(error);
  }
};
