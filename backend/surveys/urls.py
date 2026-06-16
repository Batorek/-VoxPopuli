from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnkietaViewSet, OdpowiedzViewSet

router = DefaultRouter()
router.register(r'ankiety', AnkietaViewSet, basename='ankieta')

urlpatterns = [
    path('', include(router.urls)),
    path('ankiety/<int:ankieta_pk>/odpowiedzi/',
         OdpowiedzViewSet.as_view({'post': 'create'})),
]

