# Integracja Bielik AI

Backend analizuje sentyment nowych komentarzy forum przez OpenAI-compatible Bielik Student API.

## Konfiguracja na VM

Utworz plik `backend/.env` na podstawie `backend/.env.example` albo ustaw zmienne srodowiskowe:

```env
BIELIK_BASE_URL=http://149.156.194.192:8080/v1
BIELIK_API_KEY=bsk-YOUR-TOKEN
BIELIK_MODEL=SpeakLeash/bielik-11b-v3.0-instruct:Q4_K_M
BIELIK_TIMEOUT=30
```

Nie commituj prawdziwego tokenu. Plik `.env` jest ignorowany przez `.gitignore`.

## Co robi integracja

- `POST /api/forum/watki/<id>/komentarze/` zapisuje komentarz i automatycznie ustawia `sentyment` oraz `wynik_sentymentu`.
- `GET /api/forum/watki/<id>/sentyment/` zwraca zbiorcze podsumowanie nastrojow, liczniki i sredni wynik.
- Jesli Bielik chwilowo nie odpowie albo token nie jest ustawiony, komentarz nadal sie zapisze z neutralnym sentymentem.
