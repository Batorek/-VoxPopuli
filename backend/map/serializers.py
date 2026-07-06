import json
from rest_framework import serializers
from .models import UwagaMapowa


class UwagaMapowaSerializer(serializers.ModelSerializer):
    # lat i lng wysyłane z frontendu, zamieniane na pole geometria (text/GeoJSON)
    lat = serializers.FloatField(write_only=True)
    lng = serializers.FloatField(write_only=True)

    class Meta:
        model = UwagaMapowa
        fields = [
            "id",
            "user",
            "ankieta",
            "geometria",
            "tytul",
            "opis",
            "kategoria",
            "data_dodania",
            "status",
            "lat",
            "lng",
        ]
        read_only_fields = ["user", "data_dodania", "geometria"]

    def create(self, validated_data):
        lat = validated_data.pop("lat")
        lng = validated_data.pop("lng")
        # zapisujemy jako GeoJSON string w polu TEXT
        validated_data["geometria"] = json.dumps({
            "type": "Point",
            "coordinates": [lng, lat],  # GeoJSON: najpierw lng, potem lat
        })
        return super().create(validated_data)

    def to_representation(self, instance):
        # przy odczycie: rozkładamy geometria z powrotem na lat/lng
        data = super().to_representation(instance)
        try:
            geom = json.loads(instance.geometria)
            data["lng"] = geom["coordinates"][0]
            data["lat"] = geom["coordinates"][1]
        except (json.JSONDecodeError, KeyError, TypeError, ValueError):
            data["lat"] = None
            data["lng"] = None
        return data