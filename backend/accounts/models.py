from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLA = [
        ('gosc', 'Gość'),
        ('mieszkaniec', 'Mieszkaniec'),
        ('urzednik', 'Urzędnik'),
        ('admin', 'Administrator'),
    ]
    STATUS_KONTA = [
        ('aktywny', 'Aktywny'),
        ('zablokowany', 'Zablokowany'),
        ('nieaktywny', 'Nieaktywny'),
    ]

    dzielnica = models.CharField(max_length=100, blank=True)
    adres_zamieszkania = models.CharField(max_length=255, blank=True)
    data_urodzenia = models.DateField(null=True, blank=True)
    numer_telefonu = models.CharField(max_length=20, blank=True)
    rola = models.CharField(max_length=20, choices=ROLA, default='gosc')
    czy_zweryfikowany = models.BooleanField(default=False)
    status_konta = models.CharField(max_length=20, choices=STATUS_KONTA, default='aktywny')

    def __str__(self):
        return self.username