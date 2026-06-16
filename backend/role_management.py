import csv
import os

#definicja ról
ROLE_UPRAWNIENIA = {
    'gość': {
        'opis': 'Niezalogowany użytkownik odwiedzający stronę.',
        'prawa': ['przegladanie_strony_glownej', 'wyswietlanie_wynikow_ankiet', 'podglad_mapy_uwag', 'przegladanie_forum']
    },
    'mieszkaniec': {
        'opis': 'Zalogowany mieszkaniec gminy.',
        'prawa': ['udzial_w_glosowaniach', 'dodawanie_uwag_na_mapie', 'komentowanie_forum', 'historia_glosowan', 'zglaszanie_tresci']
    },
    'urzednik': {
        'opis': 'Urzędnik zarządzający konsultacjami społecznymi.',
        'prawa': ['tworzenie_ankiet', 'zamykanie_glosowan', 'moderacja_forum', 'przegladanie_raportow', 'zarzadzanie_warstwami_mapy']
    },
    'admin': {
        'opis': 'Główny administrator systemu.',
        'prawa': ['pelna_kontrola_systemu', 'nadawanie_rol_urzednikom', 'zarzadzanie_kontami_uzytkownikow']
    }
}

def czy_jest_zarejestrowanym_mieszkancem(imie, nazwisko, pesel):
    sciezka_do_pliku = 'citizen.base.csv'
    
    if not os.path.exists(sciezka_do_pliku):
        return False, None

    with open(sciezka_do_pliku, mode='r', encoding='utf-8') as plik:
        czytnik_csv = csv.DictReader(plik)
        for wiersz in czytnik_csv:
            #ignorujemy wielkość liter i przypadkowe spacje
            if wiersz['imie'].strip().lower() == imie.strip().lower() and \
               wiersz['nazwisko'].strip().lower() == nazwisko.strip().lower() and \
               wiersz['pesel'].strip() == str(pesel).strip():
                return True
                
    return False


def przydziel_role_przy_rejestracji(imie, nazwisko, email, haslo, pesel=None):
    
    profil_uzytkownika = {
        "imie": imie,
        "nazwisko": nazwisko,
        "email": email,
        "haslo_hash": f"zaszyfrowane_{haslo}",
        "rola": "gość",  
        "czy_zweryfikowany": False,
        "status_konta": "aktywny",
    }
    
    if pesel:
        jest_mieszkancem = czy_jest_zarejestrowanym_mieszkancem(imie, nazwisko, pesel)
        if jest_mieszkancem:
            profil_uzytkownika["rola"] = "mieszkaniec"
            profil_uzytkownika["czy_zweryfikowany"] = True
            return profil_uzytkownika

    return profil_uzytkownika

def admin_nadaj_role_urzednika(konto_administratora, konto_uzytkownika, stanowisko, wydzial):

    if konto_administratora["rola"] != "admin":
        return konto_uzytkownika
        
    if not stanowisko or not wydzial:
        return konto_uzytkownika
        
    konto_uzytkownika["rola"] = "urzednik"
    konto_uzytkownika["stanowisko"] = stanowisko 
    konto_uzytkownika["wydzial"] = wydzial 
    
    return konto_uzytkownika


