from django.contrib import admin

from .models import Komentarz, Watek


@admin.register(Watek)
class WatekAdmin(admin.ModelAdmin):
    list_display = ("id", "tytul", "id_usera", "id_ankiety", "czy_zablokowany", "data_utworzenia")
    list_filter = ("czy_zablokowany", "data_utworzenia")
    search_fields = ("tytul",)


@admin.register(Komentarz)
class KomentarzAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "id_watku",
        "id_usera",
        "sentyment",
        "wynik_sentymentu",
        "czy_oflagowany",
        "czy_usuniety",
        "data_dodania",
    )
    list_filter = ("sentyment", "czy_oflagowany", "czy_usuniety", "data_dodania")
    search_fields = ("tresc",)
