// Job: check the PIN session cookie signs, verifies and expires.
import { beforeAll, describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/session";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret";
});

describe("session tokens", () => {
  it("verifies a fresh token", async () => {
    expect(await verifySessionToken(await createSessionToken())).toBe(true);
  });
  it("rejects an expired token", async () => {
    const token = await createSessionToken(Date.now() - 31 * 86_400_000);
    expect(await verifySessionToken(token)).toBe(false);
  });
  it("rejects a tampered token", async () => {
    const token = await createSessionToken();
    const [payload, sig] = token.split(".");
    expect(await verifySessionToken(`${payload}x.${sig}`)).toBe(false);
    expect(await verifySessionToken(undefined)).toBe(false);
  });
});
