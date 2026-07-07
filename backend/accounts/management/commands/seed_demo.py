from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from forum.models import Komentarz, Watek
from maps.models import UwagaMapowa
from surveys.models import Ankieta, Odpowiedz, Pytanie


DEMO_PASSWORD = "Demo123!"


class Command(BaseCommand):
    help = "Tworzy dane demo do prezentacji VoxPopuli."

    def handle(self, *args, **options):
        users = self.seed_users()
        ankiety = self.seed_surveys(users)
        self.seed_forum(users, ankiety)
        self.seed_map_notes(users, ankiety)

        self.stdout.write(self.style.SUCCESS("Dane demo sa gotowe."))
        self.stdout.write("Loginy demo:")
        self.stdout.write(f"  admin_demo / {DEMO_PASSWORD}")
        self.stdout.write(f"  urzednik_demo / {DEMO_PASSWORD}")
        self.stdout.write(f"  urzednik_mapa / {DEMO_PASSWORD}")
        self.stdout.write(f"  jan / {DEMO_PASSWORD}")
        self.stdout.write(f"  anna / {DEMO_PASSWORD}")
        self.stdout.write(f"  katarzyna / {DEMO_PASSWORD}")

    def seed_users(self):
        users = {}
        definitions = [
            {
                "username": "admin_demo",
                "email": "admin.demo@voxpopuli.local",
                "first_name": "Admin",
                "last_name": "Demo",
                "rola": "admin",
                "is_staff": True,
                "is_superuser": True,
            },
            {
                "username": "urzednik_demo",
                "email": "urzednik.demo@voxpopuli.local",
                "first_name": "Marta",
                "last_name": "Wisniewska",
                "rola": "urzednik",
                "is_staff": True,
                "is_superuser": False,
            },
            {
                "username": "urzednik_mapa",
                "email": "mapa.demo@voxpopuli.local",
                "first_name": "Pawel",
                "last_name": "Krawczyk",
                "rola": "urzednik",
                "is_staff": True,
                "is_superuser": False,
            },
            {
                "username": "jan",
                "email": "jan.kowalski@example.local",
                "first_name": "Jan",
                "last_name": "Kowalski",
                "rola": "mieszkaniec",
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "username": "anna",
                "email": "anna.nowak@example.local",
                "first_name": "Anna",
                "last_name": "Nowak",
                "rola": "mieszkaniec",
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "username": "katarzyna",
                "email": "katarzyna.zielinska@example.local",
                "first_name": "Katarzyna",
                "last_name": "Zielinska",
                "rola": "mieszkaniec",
                "is_staff": False,
                "is_superuser": False,
            },
        ]

        for data in definitions:
            user, _ = User.objects.get_or_create(
                username=data["username"],
                defaults={
                    "email": data["email"],
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                },
            )
            user.email = data["email"]
            user.first_name = data["first_name"]
            user.last_name = data["last_name"]
            user.rola = data["rola"]
            user.is_active = True
            user.is_staff = data["is_staff"]
            user.is_superuser = data["is_superuser"]
            user.czy_zweryfikowany = data["rola"] in ("mieszkaniec", "urzednik", "admin")
            user.status_konta = "aktywny"
            user.set_password(DEMO_PASSWORD)
            user.save()
            users[data["username"]] = user

        return users

    def seed_surveys(self, users):
        now = timezone.now()
        survey_defs = [
            {
                "tytul": "Bezpieczna droga do szkoly",
                "opis": "Konsultacja dotyczaca przejsc dla pieszych, progow zwalniajacych i organizacji ruchu przy szkole.",
                "kategoria": "transport",
                "pytania": [
                    ("Ktore rozwiazanie jest najpilniejsze?", "jednokrotny", 1),
                    ("Ocen bezpieczenstwo obecnej organizacji ruchu od 1 do 5.", "skala", 2),
                    ("Dodaj konkretna lokalizacje lub uwage.", "tekst", 3),
                ],
                "answers": {
                    "jan": ["Prog zwalniajacy", "2", "Najgorzej jest rano przy ulicy Szkolnej."],
                    "anna": ["Doswietlenie przejscia", "3", "Potrzebne sa lepsze oznaczenia przy przystanku."],
                    "katarzyna": ["Nowe przejscie dla pieszych", "2", "Dzieci przechodza przez jezdnie poza pasami."],
                },
            },
            {
                "tytul": "Nowy park kieszonkowy przy rynku",
                "opis": "Zbieramy opinie o malej zielonej przestrzeni z lawkami, cieniem i stojakami rowerowymi.",
                "kategoria": "zielen",
                "pytania": [
                    ("Co powinno znalezc sie w parku?", "wielokrotny", 1),
                    ("Czy popierasz realizacje projektu?", "jednokrotny", 2),
                    ("Jakie ryzyko nalezy uwzglednic?", "tekst", 3),
                ],
                "answers": {
                    "jan": ["Lawki, Drzewa, Stojaki rowerowe", "Tak", "Trzeba zadbac o kosze i regularne sprzatanie."],
                    "anna": ["Drzewa, Oswietlenie", "Tak", "Warto zostawic miejsce na male wydarzenia."],
                    "katarzyna": ["Lawki, Oswietlenie", "Raczej tak", "Potrzebne sa nasadzenia odporne na susze."],
                },
            },
        ]

        ankiety = {}
        for definition in survey_defs:
            ankieta, _ = Ankieta.objects.get_or_create(
                tytul=definition["tytul"],
                defaults={
                    "opis": definition["opis"],
                    "kategoria": definition["kategoria"],
                    "status": "aktywna",
                    "widoczna_dla_gosci": True,
                    "data_rozpoczecia": now,
                    "data_zakonczenia": now + timedelta(days=30),
                },
            )
            ankieta.opis = definition["opis"]
            ankieta.kategoria = definition["kategoria"]
            ankieta.status = "aktywna"
            ankieta.widoczna_dla_gosci = True
            ankieta.data_rozpoczecia = ankieta.data_rozpoczecia or now
            ankieta.data_zakonczenia = ankieta.data_zakonczenia or now + timedelta(days=30)
            ankieta.save()

            questions = []
            for tresc, typ, kolejnosc in definition["pytania"]:
                pytanie, _ = Pytanie.objects.get_or_create(
                    ankieta=ankieta,
                    tresc=tresc,
                    defaults={"typ": typ, "kolejnosc": kolejnosc, "wymagane": True},
                )
                pytanie.typ = typ
                pytanie.kolejnosc = kolejnosc
                pytanie.wymagane = True
                pytanie.save()
                questions.append(pytanie)

            for username, answers in definition["answers"].items():
                user = users[username]
                for pytanie, answer in zip(questions, answers):
                    Odpowiedz.objects.get_or_create(
                        pytanie=pytanie,
                        id_usera=user.id,
                        defaults={
                            "tresc_odpowiedzi": answer,
                            "adres_ip": "127.0.0.1",
                        },
                    )

            ankiety[definition["tytul"]] = ankieta

        return ankiety

    def seed_forum(self, users, ankiety):
        thread_defs = [
            {
                "tytul": "Uwagi do bezpieczenstwa przy szkole",
                "autor": "jan",
                "ankieta": "Bezpieczna droga do szkoly",
                "comments": [
                    ("anna", "Rano samochody parkuja za blisko przejscia i ograniczaja widocznosc.", "negatywny", -0.72),
                    ("katarzyna", "Dobrym pomyslem bylby dyzur strazy miejskiej przez pierwsze tygodnie.", "neutralny", 0.05),
                    ("jan", "Cieszy mnie, ze temat wreszcie trafil do konsultacji.", "pozytywny", 0.66),
                ],
            },
            {
                "tytul": "Park kieszonkowy - propozycje mieszkancow",
                "autor": "anna",
                "ankieta": "Nowy park kieszonkowy przy rynku",
                "comments": [
                    ("jan", "Popieram wiecej zieleni, ale bez rezygnacji z miejsc dla rowerow.", "pozytywny", 0.43),
                    ("katarzyna", "Najwazniejszy jest cien i miejsce odpoczynku dla seniorow.", "pozytywny", 0.58),
                    ("anna", "Prosze tez uwzglednic oswietlenie, bo plac po zmroku jest pusty.", "neutralny", -0.02),
                ],
            },
        ]

        for definition in thread_defs:
            autor = users[definition["autor"]]
            ankieta = ankiety[definition["ankieta"]]
            watek, _ = Watek.objects.get_or_create(
                tytul=definition["tytul"],
                defaults={"id_usera": autor.id, "id_ankiety": ankieta.id, "czy_zablokowany": False},
            )
            watek.id_usera = autor.id
            watek.id_ankiety = ankieta.id
            watek.czy_zablokowany = False
            watek.save()

            for username, tresc, sentyment, wynik in definition["comments"]:
                user = users[username]
                Komentarz.objects.get_or_create(
                    id_watku=watek,
                    id_usera=user.id,
                    tresc=tresc,
                    defaults={
                        "sentyment": sentyment,
                        "wynik_sentymentu": wynik,
                    },
                )

    def seed_map_notes(self, users, ankiety):
        note_defs = [
            {
                "user": "jan",
                "ankieta": "Bezpieczna droga do szkoly",
                "geometria": "POINT(21.0122 52.2297)",
                "tytul": "Niebezpieczne przejscie",
                "opis": "Slaba widocznosc przy przejsciu obok szkoly.",
                "kategoria": "bezpieczenstwo",
                "status": "oczekujaca",
            },
            {
                "user": "anna",
                "ankieta": "Nowy park kieszonkowy przy rynku",
                "geometria": "POINT(21.0175 52.2321)",
                "tytul": "Miejsce na drzewa",
                "opis": "Tutaj brakuje cienia i zieleni.",
                "kategoria": "zielen",
                "status": "zatwierdzona",
            },
            {
                "user": "katarzyna",
                "ankieta": "Bezpieczna droga do szkoly",
                "geometria": "POINT(21.0060 52.2265)",
                "tytul": "Uszkodzony chodnik",
                "opis": "Chodnik jest nierowny, trudno przejsc z wozkiem.",
                "kategoria": "infrastruktura",
                "status": "oczekujaca",
            },
        ]

        for definition in note_defs:
            user = users[definition["user"]]
            ankieta = ankiety[definition["ankieta"]]
            UwagaMapowa.objects.get_or_create(
                id_usera=user.id,
                tytul=definition["tytul"],
                defaults={
                    "id_ankiety": ankieta.id,
                    "geometria": definition["geometria"],
                    "opis": definition["opis"],
                    "kategoria": definition["kategoria"],
                    "status": definition["status"],
                },
            )
