from rest_framework import serializers
from backend.permissions import is_urzednik_or_admin
from .models import Watek, Komentarz


class KomentarzSerializer(serializers.ModelSerializer):
    # pole tylko do odczytu - pokazuje autora w stylu "Użytkownik #5"
    autor = serializers.SerializerMethodField()

    class Meta:
        model = Komentarz
        fields = [
            "id",
            "id_watku",
            "id_usera",
            "autor",
            "tresc",
            "data_dodania",
            "sentyment",
            "wynik_sentymentu",
            "czy_oflagowany",
            "czy_usuniety",
        ]
        read_only_fields = [
            "id_watku",
            "id_usera",
            "data_dodania",
            "sentyment",
            "wynik_sentymentu",
        ]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not is_urzednik_or_admin(user):
            fields.pop("sentyment", None)
            fields.pop("wynik_sentymentu", None)
        return fields

    def get_autor(self, obj):
        if obj.id_usera:
            return f"Użytkownik #{obj.id_usera}"
        return "Anonim"


class WatekSerializer(serializers.ModelSerializer):
    autor = serializers.SerializerMethodField()
    liczba_komentarzy = serializers.SerializerMethodField()

    class Meta:
        model = Watek
        fields = [
            "id",
            "tytul",
            "id_usera",
            "autor",
            "id_ankiety",
            "data_utworzenia",
            "czy_zablokowany",
            "liczba_komentarzy",
        ]
        read_only_fields = ["id_usera", "data_utworzenia"]

    def get_autor(self, obj):
        if obj.id_usera:
            return f"Użytkownik #{obj.id_usera}"
        return "Anonim"

    def get_liczba_komentarzy(self, obj):
        return obj.komentarze.filter(czy_usuniety=False).count()


class WatekDetailSerializer(WatekSerializer):
    # wersja ze wszystkimi komentarzami (do widoku szczegółowego)
    komentarze = serializers.SerializerMethodField()

    class Meta(WatekSerializer.Meta):
        fields = WatekSerializer.Meta.fields + ["komentarze"]

    def get_komentarze(self, obj):
        aktywne = obj.komentarze.filter(czy_usuniety=False)
        return KomentarzSerializer(aktywne, many=True, context=self.context).data
