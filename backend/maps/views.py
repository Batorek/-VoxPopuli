from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from backend.permissions import MieszkaniecLubTylkoOdczyt, UrzednikLubAdmin
from .models import UwagaMapowa
from .serializers import UwagaMapowaSerializer


def parse_geometry(geometria):
    if not geometria:
        return None

    text = str(geometria).strip()
    if text.upper().startswith('POINT(') and text.endswith(')'):
        try:
            lng_raw, lat_raw = text[6:-1].strip().split()
            return float(lat_raw), float(lng_raw)
        except (TypeError, ValueError):
            return None

    try:
        lat_raw, lng_raw = text.split(',', 1)
        return float(lat_raw), float(lng_raw)
    except (TypeError, ValueError):
        return None


class UwagaMapowaListCreateView(generics.ListCreateAPIView):
    serializer_class = UwagaMapowaSerializer
    permission_classes = [MieszkaniecLubTylkoOdczyt]

    def get_queryset(self):
        queryset = UwagaMapowa.objects.all()
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status='zatwierdzona')
        return queryset

    def perform_create(self, serializer):
        serializer.save(id_usera=self.request.user.id)


class UwagaMapowaModerationView(APIView):
    permission_classes = [UrzednikLubAdmin]

    def patch(self, request, pk):
        try:
            uwaga = UwagaMapowa.objects.get(pk=pk)
        except UwagaMapowa.DoesNotExist:
            return Response({'detail': 'Uwaga mapowa nie istnieje.'}, status=404)

        status = request.data.get('status')
        valid_statuses = {choice[0] for choice in UwagaMapowa.STATUS}
        if status not in valid_statuses:
            return Response({'detail': 'Nieprawidlowy status.'}, status=400)

        uwaga.status = status
        uwaga.save()
        return Response(UwagaMapowaSerializer(uwaga).data)


class UwagaMapowaHeatmapView(APIView):
    def get(self, request):
        uwagi = UwagaMapowa.objects.exclude(geometria='')
        if not request.user.is_authenticated:
            uwagi = uwagi.filter(status='zatwierdzona')

        punkty = []
        for uwaga in uwagi:
            parsed = parse_geometry(uwaga.geometria)
            if not parsed:
                continue
            lat, lng = parsed
            punkty.append({
                'lat': lat,
                'lng': lng,
                'kategoria': uwaga.kategoria,
                'status': uwaga.status,
            })

        return Response({
            'count': len(punkty),
            'points': punkty,
        })
