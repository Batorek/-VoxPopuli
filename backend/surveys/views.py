from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
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
    
    def perform_create(self, serializer):
        pytanie = serializer.validated_data['pytanie']
        uzytkownik = self.request.user

        
        czy_glosowal = Odpowiedz.objects.filter(pytanie=pytanie, id_usera=uzytkownik.id).exists()
        
        if czy_glosowal:
            
            raise ValidationError({"error_code": "VOTE_ALREADY_EXISTS"})

       
        serializer.save(id_usera=uzytkownik.id)
