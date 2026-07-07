"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "/ankiety", label: "Ankiety" },
  { href: "/forum", label: "Forum" },
  { href: "/mapa", label: "Mapa" },
  { href: "/dotacje", label: "Dotacje" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/demo", label: "Demo" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const canOpenAdmin = user?.rola === "urzednik" || user?.rola === "admin" || user?.is_superuser;
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="border-b-2 border-ink-950 bg-paper-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-ink-950"
        >
          VoxPopuli
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Główna" className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-sm font-medium text-ink-700 underline-offset-4 hover:text-seal-600 hover:underline"
            >
              {l.label}
            </Link>
          ))}
          {canOpenAdmin && (
            <Link
              href="/admin"
              className="font-sans text-sm font-medium text-ink-700 underline-offset-4 hover:text-seal-600 hover:underline"
            >
              Panel
            </Link>
          )}
          {!isLoading && user ? (
            <button
              onClick={logout}
              className="rounded border border-ink-950 px-3 py-1.5 text-sm font-medium text-ink-950 hover:bg-ink-950 hover:text-paper-50"
            >
              Wyloguj ({user.username})
            </button>
          ) : (
            !isLoading && (
              <Link
                href="/login"
                className="rounded bg-seal-500 px-4 py-1.5 text-sm font-semibold text-paper-50 hover:bg-seal-600"
              >
                Zaloguj się
              </Link>
            )
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          className="inline-flex items-center justify-center rounded p-2 text-ink-950 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!open}
        className="border-t border-ink-100 bg-paper-50 md:hidden"
      >
        <nav aria-label="Główna (mobile)" className="flex flex-col gap-1 px-4 py-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded px-2 py-2 text-base font-medium text-ink-700 hover:bg-paper-200"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {canOpenAdmin && (
            <Link
              href="/admin"
              className="rounded px-2 py-2 text-base font-medium text-ink-700 hover:bg-paper-200"
              onClick={() => setOpen(false)}
            >
              Panel
            </Link>
          )}
          {!isLoading && user ? (
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="mt-2 rounded border border-ink-950 px-3 py-2 text-left text-base font-medium text-ink-950"
            >
              Wyloguj ({user.username})
            </button>
          ) : (
            !isLoading && (
              <Link
                href="/login"
                className="mt-2 rounded bg-seal-500 px-3 py-2 text-center text-base font-semibold text-paper-50"
                onClick={() => setOpen(false)}
              >
                Zaloguj się
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
