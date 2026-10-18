// Job: a one-question confirm sheet with Cancel and a confirm action.
"use client";

import { Sheet, useSheetClose } from "./Sheet";
import styles from "./Sheet.module.css";

type Props = {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function Confirm(props: Props) {
  return (
    <Sheet label={props.message} onClose={props.onCancel} role="alertdialog">
      <ConfirmBody {...props} />
    </Sheet>
  );
}

function ConfirmBody({ message, confirmLabel, onConfirm, onCancel }: Props) {
  const close = useSheetClose();
  return (
    <>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button className="btn" type="button" onClick={() => close(onCancel)} autoFocus>
          Cancel
        </button>
        <button className="btn btn-primary" type="button" onClick={() => close(onConfirm)}>
          {confirmLabel}
        </button>
      </div>
    </>
  );
}
