from django.db import models


class UwagaMapowa(models.Model):
    STATUS = [
        ('oczekujaca', 'Oczekujaca'),
        ('zatwierdzona', 'Zatwierdzona'),
        ('odrzucona', 'Odrzucona'),
    ]

    id_usera = models.IntegerField(null=True, blank=True)
    id_ankiety = models.IntegerField(null=True, blank=True)
    geometria = models.TextField()
    tytul = models.CharField(max_length=255, blank=True)
    opis = models.TextField(blank=True)
    kategoria = models.CharField(max_length=100, blank=True)
    data_dodania = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS, default='oczekujaca')

    class Meta:
        managed = False
        db_table = 'uwaga_mapowa'
        ordering = ['-data_dodania']

    def __str__(self):
        return self.tytul or f'Uwaga mapowa #{self.id}'
