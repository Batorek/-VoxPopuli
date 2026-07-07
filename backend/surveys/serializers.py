from rest_framework import serializers
from .models import Ankieta, Pytanie, Odpowiedz


class OdpowiedzSerializer(serializers.ModelSerializer):
    class Meta:
        model = Odpowiedz
        fields = ['id', 'pytanie', 'tresc_odpowiedzi', 'data_odpowiedzi']
        read_only_fields = ['id', 'data_odpowiedzi']


class PytanieSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Pytanie
        fields = ['id', 'tresc', 'typ', 'kolejnosc', 'wymagane']


class AnkietaSerializer(serializers.ModelSerializer):
    pytania = PytanieSerializer(many=True)

    class Meta:
        model = Ankieta
        fields = ['id', 'tytul', 'opis', 'kategoria', 'status',
                  'data_rozpoczecia', 'data_zakonczenia', 'widoczna_dla_gosci', 'pytania']

    def create(self, validated_data):
        pytania_data = validated_data.pop('pytania')
        ankieta = Ankieta.objects.create(**validated_data)
        for i, pytanie_data in enumerate(pytania_data):
            pytanie_data.pop('id', None)
            Pytanie.objects.create(ankieta=ankieta, kolejnosc=pytanie_data.get('kolejnosc', i), **{
                k: v for k, v in pytanie_data.items() if k != 'kolejnosc'
            })
        return ankieta


class WynikPytaniaSerializer(serializers.Serializer):
    pytanie_id = serializers.IntegerField()
    tresc = serializers.CharField()
    typ = serializers.CharField()
    agregacja = serializers.DictField(required=False)
    odpowiedzi_tekstowe = serializers.ListField(required=False)
