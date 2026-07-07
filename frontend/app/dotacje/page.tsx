const grants = [
  {
    name: "Fundusze Europejskie dla regionu",
    scope: "infrastruktura, zielen, dostepnosc",
    status: "nabory cykliczne",
  },
  {
    name: "Programy ochrony srodowiska",
    scope: "retencja, parki, efektywnosc energetyczna",
    status: "do monitorowania",
  },
  {
    name: "Bezpieczna infrastruktura lokalna",
    scope: "drogi, przejscia, oswietlenie",
    status: "propozycje do konsultacji",
  },
];

export default function DotacjePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold">Dotacje dla gminy</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Modul opcjonalny z wymagania COULD HAVE. Mieszkaniec moze sprawdzic potencjalne
            kierunki finansowania lokalnych inicjatyw i powiazac je z konsultacjami.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {grants.map((grant) => (
            <article key={grant.name} className="bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-bold">{grant.name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{grant.scope}</p>
              <p className="mt-4 inline-flex rounded bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {grant.status}
              </p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
