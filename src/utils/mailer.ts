const nodemailer = require("nodemailer");

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailProps): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER as string,
      pass: process.env.SMTP_PASS as string,
    },
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL as string,
    to,
    subject,
    html,
  });
};
