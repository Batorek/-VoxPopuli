from django.urls import path
from .views import UwagaMapowaListCreateView, UwagaMapowaDetailView

urlpatterns = [
    path("uwagi/", UwagaMapowaListCreateView.as_view(), name="uwaga-list-create"),
    path("uwagi/<int:pk>/", UwagaMapowaDetailView.as_view(), name="uwaga-detail"),
]