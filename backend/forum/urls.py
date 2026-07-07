from django.urls import path
from .views import (
    WatekListCreateView,
    WatekDetailView,
    KomentarzListCreateView,
    WatekSentimentSummaryView,
    ModeracjaKomentarzyView,
    KomentarzModerationView,
    WatekModerationView,
)

urlpatterns = [
    path("watki/", WatekListCreateView.as_view(), name="watek-list-create"),
    path("watki/<int:pk>/", WatekDetailView.as_view(), name="watek-detail"),
    path("watki/<int:pk>/moderacja/", WatekModerationView.as_view(), name="watek-moderation"),
    path("watki/<int:watek_pk>/komentarze/", KomentarzListCreateView.as_view(), name="komentarz-list-create"),
    path("watki/<int:watek_pk>/sentyment/", WatekSentimentSummaryView.as_view(), name="watek-sentiment-summary"),
    path("moderacja/komentarze/", ModeracjaKomentarzyView.as_view(), name="moderacja-komentarze"),
    path("komentarze/<int:pk>/moderacja/", KomentarzModerationView.as_view(), name="komentarz-moderation"),
]
