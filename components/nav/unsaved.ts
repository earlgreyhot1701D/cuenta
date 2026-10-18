// Job: the shared "unsaved entries" flag a form raises and the bottom nav checks before leaving.

/** The question to ask before leaving, or null when nothing is unsaved. Only one form is on screen at a time. */
let prompt: string | null = null;

export function setUnsaved(question: string | null): void {
  prompt = question;
}

export function unsavedPrompt(): string | null {
  return prompt;
}
