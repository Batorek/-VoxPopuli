from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from backend.permissions import (
    UrzednikLubAdmin,
    ZalogowanyLubTylkoOdczyt,
    is_urzednik_or_admin,
)
from .models import Watek, Komentarz
from .serializers import WatekSerializer, WatekDetailSerializer, KomentarzSerializer
from .ai import analyze_comment_sentiment, summarize_thread_sentiment


class WatekListCreateView(generics.ListCreateAPIView):
    serializer_class = WatekSerializer
    permission_classes = [ZalogowanyLubTylkoOdczyt]

    def get_queryset(self):
        if is_urzednik_or_admin(self.request.user):
            return Watek.objects.all()
        return Watek.objects.filter(czy_zablokowany=False)

    def perform_create(self, serializer):
        user_id = self.request.user.id if self.request.user.is_authenticated else None
        serializer.save(id_usera=user_id)


class WatekDetailView(generics.RetrieveAPIView):
    serializer_class = WatekDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if is_urzednik_or_admin(self.request.user):
            return Watek.objects.all()
        return Watek.objects.filter(czy_zablokowany=False)


class KomentarzListCreateView(generics.ListCreateAPIView):
    serializer_class = KomentarzSerializer
    permission_classes = [ZalogowanyLubTylkoOdczyt]

    def get_queryset(self):
        watek_id = self.kwargs["watek_pk"]
        return Komentarz.objects.filter(
            id_watku=watek_id,
            czy_usuniety=False,
        )

    def perform_create(self, serializer):
        user_id = self.request.user.id if self.request.user.is_authenticated else None
        serializer.save(
            id_watku_id=self.kwargs["watek_pk"],
            id_usera=user_id,
        )


class WatekSentimentSummaryView(APIView):
    permission_classes = [UrzednikLubAdmin]

    def get(self, request, watek_pk):
        comments = list(
            Komentarz.objects.filter(
                id_watku=watek_pk,
                czy_usuniety=False,
            )
        )
        return Response(summarize_thread_sentiment(comments))

    def post(self, request, watek_pk):
        comments = list(
            Komentarz.objects.filter(
                id_watku=watek_pk,
                czy_usuniety=False,
            )
        )
        for comment in comments:
            result = analyze_comment_sentiment(comment.tresc)
            comment.sentyment = result.sentyment
            comment.wynik_sentymentu = result.wynik
            comment.save(update_fields=["sentyment", "wynik_sentymentu"])
        return Response(summarize_thread_sentiment(comments))


class ModeracjaKomentarzyView(generics.ListAPIView):
    serializer_class = KomentarzSerializer
    permission_classes = [UrzednikLubAdmin]

    def get_queryset(self):
        return Komentarz.objects.select_related("id_watku").all().order_by("-data_dodania")


class KomentarzModerationView(APIView):
    permission_classes = [UrzednikLubAdmin]

    def patch(self, request, pk):
        try:
            komentarz = Komentarz.objects.get(pk=pk)
        except Komentarz.DoesNotExist:
            return Response({"detail": "Komentarz nie istnieje."}, status=404)

        if "czy_oflagowany" in request.data:
            komentarz.czy_oflagowany = bool(request.data.get("czy_oflagowany"))
        if "czy_usuniety" in request.data:
            komentarz.czy_usuniety = bool(request.data.get("czy_usuniety"))
        komentarz.save()
        return Response(KomentarzSerializer(komentarz).data)


class WatekModerationView(APIView):
    permission_classes = [UrzednikLubAdmin]

    def patch(self, request, pk):
        try:
            watek = Watek.objects.get(pk=pk)
        except Watek.DoesNotExist:
            return Response({"detail": "Watek nie istnieje."}, status=404)

        if "czy_zablokowany" in request.data:
            watek.czy_zablokowany = bool(request.data.get("czy_zablokowany"))
            watek.save()
        return Response(WatekSerializer(watek).data)
