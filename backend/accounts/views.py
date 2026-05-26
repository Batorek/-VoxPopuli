from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

@api_view(['POST'])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not username or not password or not email:
        return Response({'error': 'Podaj login, haslo i email'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Uzytkownik juz istnieje'}, status=400)

    # 1. Tworzenie nieaktywnego użytkownika
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        is_active=False
    )

    # 2. Generowanie tokena i linku
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    link = f"http://127.0.0.1:8000/api/accounts/activate/{uid}/{token}/"

    # 3. Wysłanie maila (wynik zobaczysz w terminalu)
    send_mail(
        subject='Aktywacja konta',
        message=f'Kliknij w link, aby aktywowac konto: {link}',
        from_email='noreply@voxpopuli.pl',
        recipient_list=[email],
        fail_silently=False,
    )

    return Response({'message': 'Konto utworzone! Sprawdz terminal/email.'}, status=201)

@api_view(['GET'])
def activate_view(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({'message': 'Konto aktywowane pomyslnie!'}, status=200)
    else:
        return Response({'error': 'Link aktywacyjny jest nieprawidlowy lub wygasl.'}, status=400)

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user:
        if not user.is_active:
            return Response({'error': 'Konto nie jest aktywne. Sprawdz email!'}, status=403)
        
        login(request._request, user)
        return Response({'message': 'Zalogowano!'})
    return Response({'error': 'Nieprawidlowy login lub haslo'}, status=400)

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Wylogowano!'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    return Response({'message': f'Witaj {request.user.username}!'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "Tylko zalogowani to widza!"})