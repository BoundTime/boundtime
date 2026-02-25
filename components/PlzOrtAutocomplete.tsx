"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const SUGGESTION_LIMIT = 20;

export interface PlzOrtEntry {
  plz: string;
  ort: string;
  bundesland?: string | null;
}

interface PlzOrtAutocompleteProps {
  postalCode: string;
  city: string;
  onSelect: (plz: string, ort: string) => void;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
}

export function PlzOrtAutocomplete({
  postalCode,
  city,
  onSelect,
  disabled,
  id = "plz_ort",
  placeholder = "PLZ oder Ort eingeben …",
}: PlzOrtAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<PlzOrtEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = postalCode && city ? `${postalCode} ${city}` : "";

  useEffect(() => {
    if (postalCode && city) {
      setInputValue(displayValue);
    } else {
      setInputValue("");
    }
  }, [postalCode, city, displayValue]);

  const fetchByPlz = useCallback(async (prefix: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("plz_orte")
      .select("plz, ort, bundesland")
      .ilike("plz", `${prefix}%`)
      .limit(SUGGESTION_LIMIT)
      .order("plz");
    return (data ?? []) as PlzOrtEntry[];
  }, []);

  const fetchByOrt = useCallback(async (query: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("plz_orte")
      .select("plz, ort, bundesland")
      .ilike("ort", `%${query}%`)
      .limit(SUGGESTION_LIMIT)
      .order("ort");
    return (data ?? []) as PlzOrtEntry[];
  }, []);

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const isPlzSearch = /^\d+$/.test(trimmed);
    setLoading(true);
    setOpen(true);
    setHighlightIndex(-1);

    const run = async () => {
      const list = isPlzSearch
        ? await fetchByPlz(trimmed)
        : await fetchByOrt(trimmed);
      setSuggestions(list);
      setHighlightIndex(list.length > 0 ? 0 : -1);
      setLoading(false);
    };

    const t = setTimeout(run, 200);
    return () => clearTimeout(t);
  }, [inputValue, fetchByPlz, fetchByOrt]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(entry: PlzOrtEntry) {
    onSelect(entry.plz, entry.ort);
    setInputValue(`${entry.plz} ${entry.ort}`);
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i < suggestions.length - 1 ? i + 1 : i));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i > 0 ? i - 1 : -1));
    } else if (e.key === "Enter" && highlightIndex >= 0 && suggestions[highlightIndex]) {
      e.preventDefault();
      handleSelect(suggestions[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightIndex(-1);
    }
  }

  function handleClear() {
    setInputValue("");
    onSelect("", "");
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 pr-20 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {(inputValue || postalCode || city) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-gray-400 hover:bg-card hover:text-white"
          >
            Löschen
          </button>
        )}
      </div>

      {open && (inputValue.trim() || loading) && (
        <ul
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-700 bg-card py-1 shadow-xl"
          role="listbox"
        >
          {loading ? (
            <li className="px-4 py-3 text-sm text-gray-400">Suche …</li>
          ) : suggestions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">
              Kein Ort gefunden. Nur Einträge aus der Datenbasis sind wählbar.
            </li>
          ) : (
            suggestions.map((entry, i) => (
              <li
                key={`${entry.plz}-${entry.ort}-${i}`}
                role="option"
                aria-selected={i === highlightIndex}
                className={`cursor-pointer px-4 py-2 text-sm ${
                  i === highlightIndex ? "bg-accent/20 text-white" : "text-gray-300 hover:bg-card"
                }`}
                onMouseEnter={() => setHighlightIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(entry);
                }}
              >
                {entry.plz} {entry.ort}
                {entry.bundesland ? ` (${entry.bundesland})` : ""}
              </li>
            ))
          )}
        </ul>
      )}

      <p className="mt-1 text-xs text-gray-500">
        Nur gültige PLZ/Orte aus der Datenbasis. Bitte einen Vorschlag auswählen.
      </p>
    </div>
  );
}
