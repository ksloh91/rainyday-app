"use client";

import { useEffect, useState } from "react";

type SheetMotion = "enter" | "exit" | null;

type BottomSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: BottomSheetProps) {
  const [present, setPresent] = useState(open);
  const [motion, setMotion] = useState<SheetMotion>(open ? "enter" : null);

  useEffect(() => {
    if (open) {
      setPresent(true);
      setMotion("enter");
      return;
    }
    if (present) {
      setMotion("exit");
    }
  }, [open, present]);

  useEffect(() => {
    if (!present) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [present]);

  function handlePanelAnimationEnd(
    event: React.AnimationEvent<HTMLDivElement>,
  ) {
    if (event.target !== event.currentTarget) return;
    if (motion === "enter") {
      setMotion(null);
      return;
    }
    if (motion === "exit") {
      setPresent(false);
      setMotion(null);
    }
  }

  if (!present) return null;

  const panelClass =
    motion === "enter"
      ? "bottom-sheet-enter"
      : motion === "exit"
        ? "bottom-sheet-exit"
        : "bottom-sheet-open";

  const backdropVisible = motion !== "exit";

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-end ${
        motion === "exit" ? "pointer-events-none" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      aria-hidden={motion === "exit"}
    >
      <button
        type="button"
        aria-label="Close"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out ${
          backdropVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        tabIndex={motion === "exit" ? -1 : 0}
      />
      <div
        className={`relative flex max-h-[92dvh] flex-col rounded-t-2xl bg-white shadow-2xl dark:bg-zinc-900 ${panelClass}`}
        style={{
          paddingBottom: "max(0px, env(safe-area-inset-bottom))",
        }}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2
            id="sheet-title"
            className="text-base font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            tabIndex={motion === "exit" ? -1 : 0}
          >
            Cancel
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
