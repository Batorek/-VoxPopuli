from django.urls import path

from .views import (
    UwagaMapowaHeatmapView,
    UwagaMapowaListCreateView,
    UwagaMapowaModerationView,
)

urlpatterns = [
    path('uwagi/', UwagaMapowaListCreateView.as_view(), name='uwaga-mapowa-list-create'),
    path('uwagi/<int:pk>/moderacja/', UwagaMapowaModerationView.as_view(), name='uwaga-mapowa-moderation'),
    path('heatmap/', UwagaMapowaHeatmapView.as_view(), name='uwaga-mapowa-heatmap'),
]
