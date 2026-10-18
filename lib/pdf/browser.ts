// Job: launch (and keep warm) a headless Chromium: the serverless build on Vercel, local Chrome elsewhere.
import fs from "node:fs";
import puppeteer, { type Browser } from "puppeteer-core";

const LOCAL_CHROME = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

let browserPromise: Promise<Browser> | null = null;

async function launch(): Promise<Browser> {
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    chromium.setGraphicsMode = false;
    return puppeteer.launch({
      args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  }
  const executablePath = LOCAL_CHROME.find((p) => p && fs.existsSync(p));
  if (!executablePath) throw new Error("No local Chrome found; set CHROME_PATH");
  return puppeteer.launch({ executablePath, headless: true });
}

/** One browser per warm function instance; relaunched if it has gone away. */
export async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    const browser = await browserPromise.catch(() => null);
    if (browser?.connected) return browser;
  }
  browserPromise = launch();
  return browserPromise;
}
