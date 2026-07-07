from django.contrib import admin

from .models import Ankieta, Odpowiedz, Pytanie


class PytanieInline(admin.TabularInline):
    model = Pytanie
    extra = 1


@admin.register(Ankieta)
class AnkietaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "tytul",
        "kategoria",
        "status",
        "widoczna_dla_gosci",
        "data_rozpoczecia",
        "data_zakonczenia",
    )
    list_filter = ("kategoria", "status", "widoczna_dla_gosci")
    search_fields = ("tytul", "opis")
    inlines = [PytanieInline]


@admin.register(Pytanie)
class PytanieAdmin(admin.ModelAdmin):
    list_display = ("id", "ankieta", "typ", "kolejnosc", "wymagane")
    list_filter = ("typ", "wymagane")
    search_fields = ("tresc",)


@admin.register(Odpowiedz)
class OdpowiedzAdmin(admin.ModelAdmin):
    list_display = ("id", "pytanie", "id_usera", "data_odpowiedzi", "adres_ip")
    list_filter = ("data_odpowiedzi",)
    search_fields = ("tresc_odpowiedzi",)
