// Job: write one structured JSON log line per server event, never with personal data or secrets.
export type LogFields = {
  route: string;
  outcome: "ok" | "error" | "rejected";
  ms: number;
  status?: number;
  ip?: string;
  invoiceNumber?: string;
  cafe?: string;
  messageId?: string;
  /** The send went to the EMAIL_TEST_TO inbox. The address itself is never logged. */
  test?: boolean;
  error?: string;
};

export function log(fields: LogFields): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...fields }));
}
