const nodemailer = require("nodemailer");

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailProps): Promise<void> => {
  try {
    console.log("Starting email process...");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log("Verifying SMTP connection...");

    await transporter.verify();
    console.log("SMTP connection verified successfully!");

    const info = await transporter.sendMail({
      from: `"ALL COLLEGE EVENT" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    });

    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);

  } catch (error: any) {
    console.error("Email sending failed!");
    console.error("Error message:", error.message);
    console.error("Full error:", error);
  }
};

// (async () => {
//   await sendEmail({
//     to: "sivaranji5670@gmail.com",
//     subject: "Test Email",
//     html: "<h1>Hello from Hostinger SMTP 🚀</h1>",
//   });
// })();
