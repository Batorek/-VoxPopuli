import json
import logging
from dataclasses import dataclass

from django.conf import settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class SentimentResult:
    sentyment: str
    wynik: float


DEFAULT_SENTIMENT = SentimentResult(sentyment="neutralny", wynik=0.0)
VALID_SENTIMENTS = {"pozytywny", "neutralny", "negatywny"}


def _client():
    if not settings.BIELIK_API_KEY:
        return None
    try:
        from openai import OpenAI
    except ImportError:
        logger.warning("The openai package is not installed; using neutral sentiment.")
        return None

    return OpenAI(
        base_url=settings.BIELIK_BASE_URL,
        api_key=settings.BIELIK_API_KEY,
        timeout=settings.BIELIK_TIMEOUT,
    )


def _parse_sentiment(content):
    try:
        data = json.loads(content)
    except (TypeError, json.JSONDecodeError):
        logger.warning("Bielik returned non-JSON sentiment response: %r", content)
        return DEFAULT_SENTIMENT

    sentyment = str(data.get("sentyment", "")).strip().lower()
    if sentyment not in VALID_SENTIMENTS:
        return DEFAULT_SENTIMENT

    try:
        wynik = float(data.get("wynik_sentymentu", 0))
    except (TypeError, ValueError):
        wynik = 0.0

    wynik = max(-1.0, min(1.0, wynik))
    return SentimentResult(sentyment=sentyment, wynik=wynik)


def analyze_comment_sentiment(text):
    client = _client()
    if client is None:
        logger.warning("BIELIK_API_KEY is not configured; using neutral sentiment.")
        return DEFAULT_SENTIMENT

    prompt = (
        "Przeanalizuj sentyment komentarza z forum konsultacji spolecznych. "
        "Odpowiedz wylacznie poprawnym JSON-em bez markdowna, w formacie: "
        '{"sentyment":"pozytywny|neutralny|negatywny","wynik_sentymentu":0.0}. '
        "wynik_sentymentu ma byc liczba od -1.0 do 1.0, gdzie -1 oznacza "
        "bardzo negatywny komentarz, 0 neutralny, a 1 bardzo pozytywny.\n\n"
        f"Komentarz: {text[:4000]}"
    )

    try:
        response = client.chat.completions.create(
            model=settings.BIELIK_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Jestes klasyfikatorem sentymentu dla polskich komentarzy. "
                        "Zwracasz tylko JSON."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0,
        )
    except Exception:
        logger.exception("Bielik sentiment analysis failed; using neutral sentiment.")
        return DEFAULT_SENTIMENT

    content = response.choices[0].message.content
    return _parse_sentiment(content)


def summarize_thread_sentiment(comments):
    active_comments = [comment for comment in comments if comment.tresc]
    if not active_comments:
        return {
            "summary": "Brak komentarzy do analizy.",
            "counts": {"pozytywny": 0, "neutralny": 0, "negatywny": 0},
            "average_score": 0.0,
        }

    counts = {"pozytywny": 0, "neutralny": 0, "negatywny": 0}
    total_score = 0.0
    for comment in active_comments:
        counts[comment.sentyment] = counts.get(comment.sentyment, 0) + 1
        total_score += comment.wynik_sentymentu or 0.0

    average_score = total_score / len(active_comments)
    client = _client()
    if client is None:
        return {
            "summary": "Bielik nie jest skonfigurowany. Zwracam statystyki zapisanych sentymentow.",
            "counts": counts,
            "average_score": round(average_score, 3),
        }

    sample = "\n".join(
        f"- [{comment.sentyment}, {comment.wynik_sentymentu or 0:.2f}] {comment.tresc[:500]}"
        for comment in active_comments[:40]
    )
    prompt = (
        "Podsumuj nastroje w watku konsultacji spolecznych po polsku. "
        "Napisz maksymalnie 4 zdania: dominujacy nastroj, glowne obawy albo poparcie, "
        "oraz krotka rekomendacje dla urzednika.\n\n"
        f"Statystyki: {counts}, sredni wynik: {average_score:.3f}\n"
        f"Komentarze:\n{sample}"
    )

    try:
        response = client.chat.completions.create(
            model=settings.BIELIK_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "Jestes asystentem urzednika analizujacym konsultacje spoleczne.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )
        summary = response.choices[0].message.content.strip()
    except Exception:
        logger.exception("Bielik thread summary failed.")
        summary = "Nie udalo sie pobrac podsumowania z Bielika. Zwracam statystyki zapisanych sentymentow."

    return {
        "summary": summary,
        "counts": counts,
        "average_score": round(average_score, 3),
    }
