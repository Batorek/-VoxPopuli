from django.contrib import admin

from .models import UwagaMapowa


@admin.register(UwagaMapowa)
class UwagaMapowaAdmin(admin.ModelAdmin):
    list_display = ('id', 'tytul', 'kategoria', 'status', 'id_usera', 'id_ankiety', 'data_dodania')
    list_filter = ('status', 'kategoria', 'data_dodania')
    search_fields = ('tytul', 'opis', 'geometria')
