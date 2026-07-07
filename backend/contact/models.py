from django.db import models

class ContactMessage(models.Model):
    imie = models.CharField(max_length=100)
    email = models.EmailField()
    temat = models.CharField(max_length=200)
    tresc = models.TextField()
    data_wyslania = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.temat
