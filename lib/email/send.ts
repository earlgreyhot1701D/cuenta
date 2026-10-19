// Job: send one email with an attachment via Resend; sender, reply-to and test mode come only from env.
import { Resend } from "resend";
import { emailTestTo, resolveRecipient } from "./test-mode";

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  attachment: { filename: string; content: Buffer };
}): Promise<{ messageId: string; test: boolean }> {
  const { RESEND_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO } = process.env;
  if (!RESEND_API_KEY || !EMAIL_FROM) throw new Error("Email is not configured");
  // Enforced here, the only place that calls Resend, so no route or pop-up can reach a cafe in test mode.
  const testTo = emailTestTo();

  const { data, error } = await new Resend(RESEND_API_KEY).emails.send({
    from: EMAIL_FROM,
    to: resolveRecipient(input.to, testTo),
    replyTo: EMAIL_REPLY_TO || undefined,
    subject: input.subject,
    text: input.text,
    attachments: [input.attachment],
  });
  if (error || !data) throw new Error(`Resend: ${error?.name ?? "error"}: ${error?.message ?? "no message id"}`);
  return { messageId: data.id, test: testTo !== null };
}
