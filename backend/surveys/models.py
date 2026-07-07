from django.db import models

class Ankieta(models.Model):
    KATEGORIA = [
        ('transport', 'Transport'),
        ('zielen', 'Zieleń'),
        ('infrastruktura', 'Infrastruktura'),
        ('inne', 'Inne'),
    ]
    STATUS = [
        ('szkic', 'Szkic'),
        ('aktywna', 'Aktywna'),
        ('zakonczona', 'Zakończona'),
        ('archiwalna', 'Archiwalna'),
    ]

    tytul = models.CharField(max_length=255)
    opis = models.TextField(blank=True)
    kategoria = models.CharField(max_length=20, choices=KATEGORIA)
    data_utworzenia = models.DateTimeField(auto_now_add=True)
    data_rozpoczecia = models.DateTimeField(null=True, blank=True)
    data_zakonczenia = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='szkic')
    widoczna_dla_gosci = models.BooleanField(default=False)

    def __str__(self):
        return self.tytul


class Pytanie(models.Model):
    TYP = [
        ('jednokrotny', 'Jednokrotny wybór'),
        ('wielokrotny', 'Wielokrotny wybór'),
        ('skala', 'Skala'),
        ('tekst', 'Tekst'),
    ]

    ankieta = models.ForeignKey(Ankieta, on_delete=models.CASCADE, related_name='pytania')
    tresc = models.TextField()
    typ = models.CharField(max_length=20, choices=TYP)
    kolejnosc = models.IntegerField(default=0)
    wymagane = models.BooleanField(default=False)

    class Meta:
        ordering = ['kolejnosc']

    def __str__(self):
        return self.tresc


class Odpowiedz(models.Model):
    pytanie = models.ForeignKey(Pytanie, on_delete=models.CASCADE, related_name='odpowiedzi')
    id_usera = models.IntegerField(null=True, blank=True)
    tresc_odpowiedzi = models.TextField()
    data_odpowiedzi = models.DateTimeField(auto_now_add=True)
    adres_ip = models.GenericIPAddressField(null=True, blank=True)
# Create your models here.
