from django.shortcuts import render
from rest_framework import generics, permissions
from .models import UwagaMapowa
from .serializers import UwagaMapowaSerializer


class UwagaMapowaListCreateView(generics.ListCreateAPIView):
    queryset = UwagaMapowa.objects.all()
    serializer_class = UwagaMapowaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    # Gość: może pobierać listę (GET)
    # Zalogowany mieszkaniec: może dodawać uwagi (POST)

    def perform_create(self, serializer):
        # automatycznie przypisuje zalogowanego usera do uwagi
        serializer.save(user=self.request.user)


class UwagaMapowaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UwagaMapowa.objects.all()
    serializer_class = UwagaMapowaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
# Create your views here.
