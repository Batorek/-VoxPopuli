import Link from "next/link";
import {
  FileText,
  HandCoins,
  LogIn,
  MapPinned,
  MessageSquareText,
  Presentation,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

const quickActions = [
  {
    href: "/register",
    title: "Rejestracja mieszkańca",
    text: "Utwórz konto i przejdź weryfikację danych, aby brać udział w konsultacjach.",
    icon: UserPlus,
  },
  {
    href: "/login",
    title: "Logowanie",
    text: "Zaloguj się, aby głosować, komentować i zgłaszać uwagi na mapie.",
    icon: LogIn,
  },
  {
    href: "/ankiety",
    title: "Ankiety i formularze",
    text: "Przeglądaj aktywne konsultacje, oddawaj głosy i sprawdzaj wyniki.",
    icon: FileText,
  },
  {
    href: "/forum",
    title: "Forum debat",
    text: "Dyskutuj z mieszkańcami i prowadź konsultacje w jednym miejscu.",
    icon: MessageSquareText,
  },
  {
    href: "/mapa",
    title: "Mapa konsultacji",
    text: "Zobacz obszar gminy, dodaj uwagę w konkretnym miejscu i sprawdź aktywność.",
    icon: MapPinned,
  },
  {
    href: "/admin",
    title: "Panel urzędnika",
    text: "Zarządzaj ankietami, kontami, moderacją forum i analizą nastrojów.",
    icon: ShieldCheck,
  },
  {
    href: "/dotacje",
    title: "Dotacje dla gminy",
    text: "Opcjonalny moduł informacyjny o możliwych źródłach finansowania.",
    icon: HandCoins,
  },
  {
    href: "/kontakt",
    title: "Kontakt z urzędem",
    text: "Wyślij formularz kontaktowy bez konieczności rejestracji.",
    icon: MessageSquareText,
  },
  {
    href: "/demo",
    title: "Dane i scenariusze demo",
    text: "Skorzystaj z gotowych kont, PESEL-i i przykładowych kroków do prezentacji.",
    icon: Presentation,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
              VoxPopuli: System Konsultacji Społecznych
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Serwis konsultacji społecznych dla twojej gminy
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Aplikacja łączy role gościa, mieszkańca, urzędnika i administratora. Publiczne
              treści są dostępne bez logowania, a działania w konsultacjach wymagają konta.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/ankiety"
                className="inline-flex items-center gap-2 rounded bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <FileText size={18} />
                Przejdź do ankiet
              </Link>
              <Link
                href="/mapa"
                className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:border-blue-600"
              >
                <MapPinned size={18} />
                Otwórz mapę
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Funkcjonalności</h2>
            <p className="text-sm text-slate-600">Najważniejsze moduły dostępne bezpośrednio ze strony głównej.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-blue-300"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded bg-blue-50 text-blue-700">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold group-hover:text-blue-700">{action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{action.text}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
