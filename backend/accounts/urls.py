from django.urls import path
from .views import dashboard_view, login_view, logout_view, register_view, activate_view # upewnij się że nazwy się zgadzają


urlpatterns = [
    path('register/', register_view, name='register'),
    path('login/',    login_view,    name='login'),
    path('logout/',   logout_view,   name='logout'),
    path('dashboard/', dashboard_view, name='dashboard'),
    path('activate/<str:uidb64>/<str:token>/', activate_view, name='activate'),
]