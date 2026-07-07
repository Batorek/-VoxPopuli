import Link from "next/link";
import { CheckCircle2, ClipboardList, KeyRound, MapPinned, MessageSquareText, ShieldCheck, UserPlus } from "lucide-react";

const accounts = [
  ["Administrator", "admin_demo", "Demo123!", "zarzadzanie kontami, dodawanie urzednikow"],
  ["Urzednik", "urzednik_demo", "Demo123!", "ankiety, moderacja forum, analiza AI"],
  ["Urzednik mapy", "urzednik_mapa", "Demo123!", "moderacja uwag mapowych"],
  ["Mieszkaniec", "jan", "Demo123!", "glosowanie, forum, mapa"],
  ["Mieszkaniec", "anna", "Demo123!", "glosowanie, forum, mapa"],
  ["Mieszkaniec", "katarzyna", "Demo123!", "glosowanie, forum, mapa"],
];

const pesels = [
  ["Jan", "Kowalski", "95010112345"],
  ["Anna", "Nowak", "92031554321"],
  ["Katarzyna", "Zielinska", "88082498765"],
];

const scenarios = [
  {
    title: "Rejestracja mieszkanca przez PESEL",
    icon: UserPlus,
    href: "/register",
    steps: [
      "Otworz formularz rejestracji.",
      "Wpisz dane z listy PESEL, np. Jan Kowalski 95010112345.",
      "Pokaz, ze konto powstaje tylko wtedy, gdy dane pasuja do fikcyjnej bazy.",
    ],
  },
  {
    title: "Ankiety i glosowanie",
    icon: ClipboardList,
    href: "/ankiety",
    steps: [
      "Jako gosc pokaz liste aktywnych konsultacji.",
      "Zaloguj sie jako jan / Demo123! i oddaj glos w ankiecie.",
      "Pokaz wyniki i ochrone przed ponownym oddaniem glosu na to samo pytanie.",
    ],
  },
  {
    title: "Forum debat",
    icon: MessageSquareText,
    href: "/forum",
    steps: [
      "Jako mieszkaniec dodaj komentarz w watku demo.",
      "Pokaz, ze komentarz pojawia sie bez automatycznego odpalania AI.",
      "Zaloguj sie jako urzednik_demo i wykonaj analize AI z panelu lub watku.",
    ],
  },
  {
    title: "Mapa konsultacji",
    icon: MapPinned,
    href: "/mapa",
    steps: [
      "Jako gosc pokaz zatwierdzone uwagi i mape aktywnosci.",
      "Jako mieszkaniec dodaj nowa uwage mapowa.",
      "Jako urzednik zatwierdz albo odrzuc uwage w panelu.",
    ],
  },
  {
    title: "Panel urzednika",
    icon: ShieldCheck,
    href: "/admin",
    steps: [
      "Zaloguj sie jako urzednik_demo.",
      "Pokaz moderacje forum, blokowanie watku i usuwanie komentarzy.",
      "Kliknij Analizuj AI przy watku, aby Bielik ocenil komentarze.",
    ],
  },
  {
    title: "Panel administratora",
    icon: KeyRound,
    href: "/admin",
    steps: [
      "Zaloguj sie jako admin_demo.",
      "W zakladce kont dodaj nowego urzednika.",
      "Zmien role lub status konta i pokaz blokowanie uzytkownika.",
    ],
  },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Tryb prezentacyjny</p>
          <h1 className="mt-2 text-3xl font-bold">Dane demo i przyklady uzycia</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Po starcie Dockera komenda seed_demo tworzy ponizsze konta, ankiety, komentarze
            i uwagi mapowe. Wszystkie hasla sa pokazowe i sluza tylko do prezentacji.
          </p>
        </div>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-xl font-bold">Konta do logowania</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">Rola</th>
                    <th>Login</th>
                    <th>Haslo</th>
                    <th>Co pokazac</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(([role, login, password, usage]) => (
                    <tr key={login} className="border-b">
                      <td className="py-2 font-semibold">{role}</td>
                      <td>{login}</td>
                      <td>{password}</td>
                      <td className="text-slate-600">{usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-xl font-bold">PESEL do rejestracji</h2>
            <div className="grid gap-3">
              {pesels.map(([name, surname, pesel]) => (
                <div key={pesel} className="border border-slate-200 p-3">
                  <p className="font-semibold">{name} {surname}</p>
                  <p className="text-sm text-slate-600">{pesel}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">Scenariusze prezentacji</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {scenarios.map((scenario) => {
              const Icon = scenario.icon;
              return (
                <article key={scenario.title} className="bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-blue-50 text-blue-700">
                      <Icon size={21} />
                    </span>
                    <h3 className="font-bold">{scenario.title}</h3>
                  </div>
                  <ol className="space-y-3 text-sm leading-6 text-slate-600">
                    {scenario.steps.map((step) => (
                      <li key={step} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-green-700" size={16} />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <Link
                    href={scenario.href}
                    className="mt-5 inline-flex rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    Otworz modul
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
