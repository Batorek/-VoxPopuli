import json
from django.conf import settings
from django.db import models


class UwagaMapowa(models.Model):
    STATUS_CHOICES = [
        ("oczekujaca", "Oczekująca"),
        ("zatwierdzona", "Zatwierdzona"),
        ("odrzucona", "Odrzucona"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column="id_usera",
        related_name="uwagi_mapowe",
    )
    ankieta = models.ForeignKey(
        "surveys.Ankieta",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="id_ankiety",
        related_name="uwagi",
    )

    # pole TEXT w bazie - przechowujemy jako GeoJSON string: {"type":"Point","coordinates":[lng, lat]}
    geometria = models.TextField()
    tytul = models.CharField(max_length=200)
    opis = models.TextField(blank=True)
    kategoria = models.CharField(max_length=100)
    data_dodania = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="oczekujaca")

    class Meta:
        managed = False
        db_table = "uwaga_mapowa"

    def __str__(self):
        return self.tytul

    def get_coordinates(self):
        try:
            geom = json.loads(self.geometria)
            lng, lat = geom["coordinates"]
            return lat, lng
        except (json.JSONDecodeError, KeyError, TypeError, ValueError):
            return None, None