from rest_framework import serializers
from .models import Ankieta, Pytanie, Odpowiedz

class OdpowiedzSerializer(serializers.ModelSerializer):
    class Meta:
        model = Odpowiedz
        fields = ['id', 'pytanie', 'tresc_odpowiedzi', 'data_odpowiedzi']

class PytanieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pytanie
        fields = ['id', 'tresc', 'typ', 'kolejnosc', 'wymagane']

class AnkietaSerializer(serializers.ModelSerializer):
    pytania = PytanieSerializer(many=True, read_only=True)

    class Meta:
        model = Ankieta
        fields = ['id', 'tytul', 'opis', 'kategoria', 'status',
                  'data_rozpoczecia', 'data_zakonczenia', 'widoczna_dla_gosci', 'pytania']
