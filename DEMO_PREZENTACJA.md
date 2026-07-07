# VoxPopuli - dane demo

Po uruchomieniu `docker compose up --build -d` backend wykonuje:

```bash
python manage.py migrate
python manage.py seed_demo
```

Komenda `seed_demo` jest idempotentna, wiec mozna uruchamiac ja wiele razy:

```bash
docker compose exec backend python manage.py seed_demo
```

## Konta

Wszystkie konta demo maja haslo: `Demo123!`

| Rola | Login | Zastosowanie |
| --- | --- | --- |
| Administrator | `admin_demo` | zarzadzanie kontami, dodawanie urzednikow |
| Urzednik | `urzednik_demo` | ankiety, moderacja forum, analiza AI |
| Urzednik mapy | `urzednik_mapa` | moderacja uwag mapowych |
| Mieszkaniec | `jan` | glosowanie, forum, mapa |
| Mieszkaniec | `anna` | glosowanie, forum, mapa |
| Mieszkaniec | `katarzyna` | glosowanie, forum, mapa |

## PESEL do rejestracji

| Imie | Nazwisko | PESEL |
| --- | --- | --- |
| Jan | Kowalski | `95010112345` |
| Anna | Nowak | `92031554321` |
| Katarzyna | Zielinska | `88082498765` |

## Scenariusze

1. Rejestracja: wejdz w `/register`, wpisz jedne z danych PESEL. Niepasujacy PESEL blokuje konto.
2. Ankiety: wejdz w `/ankiety`, pokaz konsultacje jako gosc, potem zaloguj mieszkanca i oddaj glos.
3. Forum: mieszkaniec dodaje komentarz. Bielik nie analizuje go automatycznie.
4. Analiza AI: zaloguj `urzednik_demo`, wejdz w panel albo watek i kliknij `Analizuj AI`.
5. Mapa: mieszkaniec dodaje uwage mapowa, urzednik zatwierdza lub odrzuca ja w panelu.
6. Admin: zaloguj `admin_demo`, wejdz w konta i dodaj nowego urzednika.

Strona z tymi samymi danymi jest dostepna w aplikacji pod `/demo`.
