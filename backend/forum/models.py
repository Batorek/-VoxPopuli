from django.db import models


class Watek(models.Model):
    # id_usera jako IntegerField - spójnie z Odpowiedz w surveys
    id_usera = models.IntegerField(null=True, blank=True)
    id_ankiety = models.IntegerField(null=True, blank=True)
    tytul = models.CharField(max_length=255)
    data_utworzenia = models.DateTimeField(auto_now_add=True)
    czy_zablokowany = models.BooleanField(default=False)

    class Meta:
        managed = False          # tabela już istnieje w bazie
        db_table = "watek"
        ordering = ["-data_utworzenia"]

    def __str__(self):
        return self.tytul


class Komentarz(models.Model):
    SENTYMENT_CHOICES = [
        ("pozytywny", "Pozytywny"),
        ("neutralny", "Neutralny"),
        ("negatywny", "Negatywny"),
    ]

    id_watku = models.ForeignKey(
        Watek,
        on_delete=models.CASCADE,
        db_column="id_watku",
        related_name="komentarze",
    )
    id_usera = models.IntegerField(null=True, blank=True)
    tresc = models.TextField()
    data_dodania = models.DateTimeField(auto_now_add=True)
    sentyment = models.CharField(
        max_length=20, choices=SENTYMENT_CHOICES, default="neutralny"
    )
    wynik_sentymentu = models.FloatField(null=True, blank=True)
    czy_oflagowany = models.BooleanField(default=False)
    czy_usuniety = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = "komentarz"
        ordering = ["data_dodania"]   # czat: najstarsze na górze

    def __str__(self):
        return f"Komentarz #{self.id} w wątku #{self.id_watku_id}"