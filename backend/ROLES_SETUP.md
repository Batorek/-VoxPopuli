# Role uzytkownikow

System obsluguje cztery role zgodne z opisem projektu:

- `gosc` - moze przegladac publiczne ankiety, wyniki i forum, ale nie moze glosowac ani komentowac.
- `mieszkaniec` - moze odpowiadac w ankietach, tworzyc watki i dodawac komentarze. Komentarze dostaja sentyment AI.
- `urzednik` - moze tworzyc i edytowac ankiety oraz moderowac watki i komentarze.
- `admin` - ma uprawnienia urzednika oraz zarzadzanie kontami uzytkownikow.

## Panele

- Django admin: `/admin/`
- Panel aplikacji Next.js: `/admin`

## Endpointy administracyjne

- `GET /api/accounts/admin/users/` - lista uzytkownikow, tylko admin.
- `PATCH /api/accounts/admin/users/<id>/` - zmiana roli, statusu i weryfikacji, tylko admin.
- `GET /api/forum/moderacja/komentarze/` - komentarze do moderacji, urzednik/admin.
- `PATCH /api/forum/komentarze/<id>/moderacja/` - flaga/usuniecie komentarza, urzednik/admin.
- `PATCH /api/forum/watki/<id>/moderacja/` - blokada/odblokowanie watku, urzednik/admin.
- `GET /api/maps/uwagi/` - lista uwag mapowych.
- `POST /api/maps/uwagi/` - dodanie uwagi mapowej, mieszkaniec.
- `PATCH /api/maps/uwagi/<id>/moderacja/` - zatwierdzanie lub odrzucanie uwag mapowych, urzednik/admin.
- `GET /api/maps/heatmap/` - dane mapy ciepla.

## Tworzenie kont uprzywilejowanych

Najprosciej utworzyc superusera:

```bash
python manage.py createsuperuser
```

Superuser jest traktowany w API jak `admin`. Z panelu `/admin` moze pozniej nadawac role `urzednik` i `admin` innym kontom.
