import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendMail = async (toEmail, subject, htmlBody) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error("GMAIL_USER or GMAIL_PASS not set in environment variables.");
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: toEmail,
      subject,
      html: htmlBody,
    });
    if(!info){
        console.log("something went wrong while sending email")
    }
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
