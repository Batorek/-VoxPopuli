SET search_path TO public;

-- ENUMY
CREATE TYPE user_role AS ENUM ('guest', 'mieszkaniec', 'urzednik', 'admin');
CREATE TYPE user_status AS ENUM ('aktywny', 'zablokowany', 'nieaktywny');
CREATE TYPE ankieta_kategoria AS ENUM ('transport', 'zielen', 'infrastruktura', 'inne');
CREATE TYPE ankieta_status AS ENUM ('szkic', 'aktywna', 'zakonczona', 'archiwalna');
CREATE TYPE pytanie_typ AS ENUM ('jednokrotny', 'wielokrotny', 'skala', 'tekst');
CREATE TYPE uwaga_status AS ENUM ('oczekujaca', 'zatwierdzona', 'odrzucona');
CREATE TYPE komentarz_sentyment AS ENUM ('pozytywny', 'neutralny', 'negatywny');
CREATE TYPE powiadomienie_typ AS ENUM ('nowa_ankieta', 'wynik', 'moderacja');

---------------------------------------------------------
-- USER
---------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    imie VARCHAR(100),
    nazwisko VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    haslo_hash VARCHAR(255) NOT NULL,
    adres_zamieszkania TEXT,
    dzielnica VARCHAR(100),
    data_urodzenia DATE,
    numer_telefonu VARCHAR(20),
    data_rejestracji TIMESTAMP DEFAULT NOW(),
    ostatnie_logowanie TIMESTAMP,
    rola user_role NOT NULL DEFAULT 'mieszkaniec',
    status_konta user_status NOT NULL DEFAULT 'aktywny'
);

---------------------------------------------------------
-- ANKIETA
---------------------------------------------------------
CREATE TABLE ankieta (
    id SERIAL PRIMARY KEY,
    tytul VARCHAR(255) NOT NULL,
    opis TEXT,
    kategoria ankieta_kategoria NOT NULL,
    data_utworzenia TIMESTAMP DEFAULT NOW(),
    data_rozpoczecia TIMESTAMP,
    data_zakonczenia TIMESTAMP,
    status ankieta_status NOT NULL DEFAULT 'szkic',
    id_urzednika INTEGER REFERENCES users(id),
    widoczna_dla_gosci BOOLEAN DEFAULT FALSE
);

---------------------------------------------------------
-- PYTANIE
---------------------------------------------------------
CREATE TABLE pytanie (
    id SERIAL PRIMARY KEY,
    id_ankiety INTEGER REFERENCES ankieta(id) ON DELETE CASCADE,
    tresc TEXT NOT NULL,
    typ pytanie_typ NOT NULL,
    kolejnosc INTEGER,
    wymagane BOOLEAN DEFAULT FALSE
);

---------------------------------------------------------
-- ODPOWIEDŹ
---------------------------------------------------------
CREATE TABLE odpowiedz (
    id SERIAL PRIMARY KEY,
    id_pytania INTEGER REFERENCES pytanie(id) ON DELETE CASCADE,
    id_usera INTEGER REFERENCES users(id),
    tresc_odpowiedzi TEXT,
    data_odpowiedzi TIMESTAMP DEFAULT NOW(),
    adres_ip VARCHAR(50)
);

---------------------------------------------------------
-- UWAGA MAPOWA
---------------------------------------------------------
CREATE TABLE uwaga_mapowa (
    id SERIAL PRIMARY KEY,
    id_usera INTEGER REFERENCES users(id),
    id_ankiety INTEGER REFERENCES ankieta(id),
    geometria TEXT NOT NULL,
    tytul VARCHAR(255),
    opis TEXT,
    kategoria VARCHAR(100),
    data_dodania TIMESTAMP DEFAULT NOW(),
    status uwaga_status DEFAULT 'oczekujaca'
);

---------------------------------------------------------
-- WĄTEK (FORUM)
---------------------------------------------------------
CREATE TABLE watek (
    id SERIAL PRIMARY KEY,
    tytul VARCHAR(255) NOT NULL,
    id_usera INTEGER REFERENCES users(id),
    id_ankiety INTEGER REFERENCES ankieta(id),
    data_utworzenia TIMESTAMP DEFAULT NOW(),
    czy_zablokowany BOOLEAN DEFAULT FALSE
);

---------------------------------------------------------
-- KOMENTARZ
---------------------------------------------------------
CREATE TABLE komentarz (
    id SERIAL PRIMARY KEY,
    id_watku INTEGER REFERENCES watek(id) ON DELETE CASCADE,
    id_usera INTEGER REFERENCES users(id),
    tresc TEXT NOT NULL,
    data_dodania TIMESTAMP DEFAULT NOW(),
    sentyment komentarz_sentyment DEFAULT 'neutralny',
    wynik_sentymentu FLOAT,
    czy_oflagowany BOOLEAN DEFAULT FALSE,
    czy_usuniety BOOLEAN DEFAULT FALSE
);

---------------------------------------------------------
-- POWIADOMIENIE
---------------------------------------------------------
CREATE TABLE powiadomienie (
    id SERIAL PRIMARY KEY,
    id_usera INTEGER REFERENCES users(id),
    tresc TEXT NOT NULL,
    typ powiadomienie_typ NOT NULL,
    data_wyslania TIMESTAMP DEFAULT NOW(),
    czy_przeczytane BOOLEAN DEFAULT FALSE
);

---------------------------------------------------------
-- CONTACT MESAGE
---------------------------------------------------------
CREATE TABLE contact_message (
    id SERIAL PRIMARY KEY,
    imie VARCHAR(100),
    email VARCHAR(255),
    temat VARCHAR(200),
    tresc TEXT,
    data_wyslania TIMESTAMP DEFAULT NOW()
);