from django.urls import path
from .views import (
    dashboard_view,
    login_view,
    logout_view,
    register_view,
    activate_view,
    csrf_view,
    me_view,
    admin_users_view,
    admin_user_detail_view,
)

urlpatterns = [
    path('register/', register_view, name='register'),
    path('login/',    login_view,    name='login'),
    path('logout/',   logout_view,   name='logout'),
    path('dashboard/', dashboard_view, name='dashboard'),
    path('me/', me_view, name='me'),
    path('admin/users/', admin_users_view, name='admin-users'),
    path('admin/users/<int:pk>/', admin_user_detail_view, name='admin-user-detail'),
    path('activate/<str:uidb64>/<str:token>/', activate_view, name='activate'),
    path('csrf/', csrf_view, name='csrf'),
]
