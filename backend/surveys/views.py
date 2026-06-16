from rest_framework import viewsets, permissions
from .models import Ankieta, Odpowiedz
from .serializers import AnkietaSerializer, OdpowiedzSerializer

class AnkietaViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AnkietaSerializer

    def get_queryset(self):
        return Ankieta.objects.filter(status='aktywna')

class OdpowiedzViewSet(viewsets.ModelViewSet):
    serializer_class = OdpowiedzSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Odpowiedz.objects.filter(pytanie__ankieta_id=self.kwargs.get('ankieta_pk'))
