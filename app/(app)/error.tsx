// Job: show one quiet line instead of a blank screen when a page fails to load.
"use client";

import { useEffect } from "react";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("page", error);
  }, [error]);
  return (
    <>
      <p className="quiet">Couldn&apos;t load this. Check the connection and try again.</p>
      <button className="btn" type="button" onClick={reset} style={{ marginTop: "1rem" }}>
        Try again
      </button>
    </>
  );
}
