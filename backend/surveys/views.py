from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from backend.permissions import (
    MieszkaniecLubTylkoOdczyt,
    UrzednikAdminLubTylkoOdczyt,
    is_urzednik_or_admin,
)
from .models import Ankieta, Odpowiedz
from .serializers import AnkietaSerializer, OdpowiedzSerializer


class AnkietaViewSet(viewsets.ModelViewSet):
    serializer_class = AnkietaSerializer
    permission_classes = [UrzednikAdminLubTylkoOdczyt]

    def get_queryset(self):
        if is_urzednik_or_admin(self.request.user):
            return Ankieta.objects.all()
        return Ankieta.objects.filter(status='aktywna', widoczna_dla_gosci=True)

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['get'])
    def wyniki(self, request, pk=None):
        ankieta = self.get_object()
        wyniki = []
        responder_keys = set()

        for pytanie in ankieta.pytania.all():
            odpowiedzi = pytanie.odpowiedzi.all()
            for odpowiedz in odpowiedzi:
                responder_keys.add((
                    odpowiedz.id_usera,
                    odpowiedz.adres_ip,
                    odpowiedz.data_odpowiedzi.date(),
                ))

            if pytanie.typ in ('jednokrotny', 'wielokrotny', 'skala'):
                agregacja = dict(
                    odpowiedzi.values('tresc_odpowiedzi')
                    .annotate(liczba=Count('id'))
                    .values_list('tresc_odpowiedzi', 'liczba')
                )
                wyniki.append({
                    'pytanie_id': pytanie.id,
                    'tresc': pytanie.tresc,
                    'typ': pytanie.typ,
                    'agregacja': agregacja,
                })
            else:
                wyniki.append({
                    'pytanie_id': pytanie.id,
                    'tresc': pytanie.tresc,
                    'typ': pytanie.typ,
                    'odpowiedzi_tekstowe': list(
                        odpowiedzi.values_list('tresc_odpowiedzi', flat=True)
                    ),
                })

        return Response({
            'ankieta': AnkietaSerializer(ankieta).data,
            'liczba_odpowiedzi': len(responder_keys),
            'wyniki': wyniki,
        })


class OdpowiedzViewSet(viewsets.ModelViewSet):
    serializer_class = OdpowiedzSerializer
    permission_classes = [MieszkaniecLubTylkoOdczyt]

    def get_queryset(self):
        return Odpowiedz.objects.filter(pytanie__ankieta_id=self.kwargs.get('ankieta_pk'))

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            raise PermissionDenied('Musisz byc zalogowany jako mieszkaniec.')

        pytanie = serializer.validated_data['pytanie']
        if str(pytanie.ankieta_id) != str(self.kwargs.get('ankieta_pk')):
            raise ValidationError({'pytanie': 'Pytanie nie nalezy do tej ankiety.'})

        if Odpowiedz.objects.filter(
            pytanie=pytanie,
            id_usera=self.request.user.id,
        ).exists():
            raise ValidationError({'detail': 'Oddales juz odpowiedz na to pytanie.'})

        serializer.save(
            id_usera=self.request.user.id,
            adres_ip=self.request.META.get('REMOTE_ADDR'),
        )
