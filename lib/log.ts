// Job: write one structured JSON log line per server event, never with personal data or secrets.
export type LogFields = {
  route: string;
  outcome: "ok" | "error" | "rejected";
  ms: number;
  status?: number;
  invoiceNumber?: string;
  cafe?: string;
  messageId?: string;
  error?: string;
};

export function log(fields: LogFields): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...fields }));
}
