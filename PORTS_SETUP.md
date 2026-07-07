# Porty VM

Dostepne porty aplikacji:

- `8902` - Django backend i API
- `8903` - PostgreSQL/PostGIS wystawiony na hosta
- `8904` - Next.js frontend

Adres kontenera:

- `10.191.221.67`

Frontend domyslnie laczy sie z API pod:

```env
NEXT_PUBLIC_API_URL=http://10.191.221.67:8902/api
```

Jesli aplikacja jest uruchamiana pod innym hostem, ustaw `NEXT_PUBLIC_API_URL` przed buildem frontendu albo w `frontend/.env`.

Glowne adresy:

- Frontend: `http://10.191.221.67:8904`
- Backend API: `http://10.191.221.67:8902/api`
- Django admin: `http://10.191.221.67:8902/admin/`

Najprostsze uruchomienie calego zestawu:

```bash
docker compose up --build
```
