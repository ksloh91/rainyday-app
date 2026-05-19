"use client";

import { useId, useMemo, useRef, useState } from "react";
import { filterSuggestions } from "@/lib/transaction-suggestions";

type AutocompleteInputProps = {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  autoFocus?: boolean;
};

export function AutocompleteInput({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  autoFocus,
}: AutocompleteInputProps) {
  const listId = useId();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);

  const matches = useMemo(
    () => filterSuggestions(value, suggestions),
    [value, suggestions],
  );

  const showList = open && value.trim().length > 0 && matches.length > 0;

  function scheduleClose() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(() => setOpen(false), 150);
  }

  function pick(suggestion: string) {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    onChange(suggestion);
    setOpen(false);
  }

  return (
    <div className="relative">
      <label
        htmlFor={listId}
        className="block text-xs font-medium text-zinc-500 dark:text-zinc-400"
      >
        {label}
      </label>
      <input
        id={listId}
        type="text"
        value={value}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={scheduleClose}
        className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={showList ? `${listId}-list` : undefined}
      />
      {showList ? (
        <ul
          id={`${listId}-list`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {matches.map((item) => (
            <li key={item} role="option">
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm text-zinc-900 active:bg-zinc-100 dark:text-zinc-50 dark:active:bg-zinc-800"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(item)}
              >
                {highlightMatch(item, value)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;

  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const index = lowerText.indexOf(lowerQ);
  if (index < 0) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + q.length);
  const after = text.slice(index + q.length);

  return (
    <>
      {before}
      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
        {match}
      </span>
      {after}
    </>
  );
}
