// Job: a blush sheet over the current screen that the phone's back button, Cancel or a tap outside closes.
"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import styles from "./Sheet.module.css";

/** Closes the sheet (stepping back off its history entry first), then runs `then`. */
const SheetCloseContext = createContext<(then: () => void) => void>((then) => then());

export function useSheetClose() {
  return useContext(SheetCloseContext);
}

export function Sheet({
  label,
  onClose,
  role = "dialog",
  children,
}: {
  label: string;
  onClose: () => void;
  role?: "dialog" | "alertdialog";
  children: React.ReactNode;
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const afterBack = useRef<(() => void) | null>(null);

  // The open sheet gets its own history entry, so the back button closes the sheet instead of
  // leaving the screen. Pushed once (dev StrictMode re-runs effects), and never popped from cleanup,
  // where a late history.back() could undo a navigation the caller just made.
  useEffect(() => {
    if (!window.history.state?.cuentaSheet) {
      window.history.pushState({ ...window.history.state, cuentaSheet: true }, "");
    }
    const onPop = () => {
      const then = afterBack.current ?? onCloseRef.current;
      afterBack.current = null;
      then();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const closeThen = useCallback((then: () => void) => {
    if (window.history.state?.cuentaSheet) {
      afterBack.current = then;
      window.history.back();
    } else {
      then();
    }
  }, []);

  return (
    <SheetCloseContext.Provider value={closeThen}>
      <div className={styles.backdrop} onClick={() => closeThen(onCloseRef.current)} data-print-hide>
        <div className={styles.sheet} role={role} aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </SheetCloseContext.Provider>
  );
}
