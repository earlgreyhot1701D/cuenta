// Job: send one email with an attachment via Resend; sender and reply-to come only from env.
import { Resend } from "resend";

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  attachment: { filename: string; content: Buffer };
}): Promise<{ messageId: string }> {
  const { RESEND_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO } = process.env;
  if (!RESEND_API_KEY || !EMAIL_FROM) throw new Error("Email is not configured");

  const { data, error } = await new Resend(RESEND_API_KEY).emails.send({
    from: EMAIL_FROM,
    to: input.to,
    replyTo: EMAIL_REPLY_TO || undefined,
    subject: input.subject,
    text: input.text,
    attachments: [input.attachment],
  });
  if (error || !data) throw new Error(`Resend: ${error?.name ?? "error"}: ${error?.message ?? "no message id"}`);
  return { messageId: data.id };
}
