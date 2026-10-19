// Job: Eileen's email test mode: while EMAIL_TEST_TO is set, every send goes there instead of the cafe.

/** The test inbox, or null when test mode is off (unset or blank). Server-only: never sent to the browser except to show it in the pop-up. */
export function emailTestTo(env: Record<string, string | undefined> = process.env): string | null {
  const testTo = env.EMAIL_TEST_TO?.trim();
  return testTo ? testTo : null;
}

/** Who really receives a send: the test inbox whenever one is set, otherwise the address typed in To. */
export function resolveRecipient(to: string, testTo: string | null): string {
  return testTo ?? to;
}
