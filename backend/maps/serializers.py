from rest_framework import serializers

from .models import UwagaMapowa


class UwagaMapowaSerializer(serializers.ModelSerializer):
    autor = serializers.SerializerMethodField()

    class Meta:
        model = UwagaMapowa
        fields = [
            'id',
            'id_usera',
            'autor',
            'id_ankiety',
            'geometria',
            'tytul',
            'opis',
            'kategoria',
            'data_dodania',
            'status',
        ]
        read_only_fields = ['id_usera', 'data_dodania', 'status']

    def get_autor(self, obj):
        if obj.id_usera:
            return f'Uzytkownik #{obj.id_usera}'
        return 'Anonim'
