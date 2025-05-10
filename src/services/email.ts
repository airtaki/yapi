import { createTransport } from "nodemailer";
import { getConfig, parseBoolean, parseNumber } from "../utils/config";

const host = getConfig<string>("mailing.host");
const port = getConfig<number>("mailing.port", parseNumber);
const secure = getConfig<boolean>("mailing.secure", parseBoolean);
const user = getConfig<string>("mailing.username");
const pass = getConfig<string>("mailing.password");
const fromName = getConfig<string>("mailing.from.name");
const fromEmail = getConfig<string>("mailing.from.email");

export const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  text,
  html,
}: {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
}): Promise<void> => {
  const transporter = createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
  });
};
