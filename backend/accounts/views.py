from django.contrib.auth import authenticate, logout
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from backend.permissions import AdminOnly, user_role
from role_management import czy_jest_zarejestrowanym_mieszkancem
from .models import User


def serialize_user(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'rola': user_role(user),
        'czy_zweryfikowany': user.czy_zweryfikowany,
        'status_konta': user.status_konta,
        'is_active': user.is_active,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    }


@api_view(['POST'])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    pesel = request.data.get('pesel')
    imie = request.data.get('imie', '')
    nazwisko = request.data.get('nazwisko', '')

    if not username or not password or not email or not imie or not nazwisko or not pesel:
        return Response({'detail': 'Podaj login, haslo, email, imie, nazwisko i PESEL.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'detail': 'Uzytkownik juz istnieje.'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'detail': 'Konto z tym adresem email juz istnieje.'}, status=400)

    if not czy_jest_zarejestrowanym_mieszkancem(imie, nazwisko, pesel):
        return Response(
            {'detail': 'PESEL nie znajduje sie w bazie mieszkancow albo dane nie pasuja.'},
            status=403,
        )

    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        first_name=imie,
        last_name=nazwisko,
        is_active=True,
        rola='mieszkaniec',
        czy_zweryfikowany=True,
        status_konta='aktywny',
    )

    return Response({
        'message': 'Konto mieszkanca utworzone i zweryfikowane.',
        'user': serialize_user(user),
    }, status=201)


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
    return Response({'error': 'Link aktywacyjny jest nieprawidlowy lub wygasl.'}, status=400)


@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user:
        if not user.is_active:
            return Response({'error': 'Konto nie jest aktywne.'}, status=403)
        if user.status_konta != 'aktywny':
            return Response({'error': 'Konto jest zablokowane lub nieaktywne.'}, status=403)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
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
    return Response({'message': 'Tylko zalogowani to widza!'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user
    return Response(serialize_user(user))


@api_view(['GET'])
@ensure_csrf_cookie
def csrf_view(request):
    return Response({'detail': 'CSRF cookie set'})


@api_view(['GET', 'POST'])
@permission_classes([AdminOnly])
def admin_users_view(request):
    if request.method == 'POST':
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        if not username or not password or not email:
            return Response({'detail': 'Podaj login, haslo i email urzednika.'}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({'detail': 'Uzytkownik juz istnieje.'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'detail': 'Konto z tym adresem email juz istnieje.'}, status=400)

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_active=True,
            is_staff=True,
            rola='urzednik',
            czy_zweryfikowany=True,
            status_konta='aktywny',
        )
        return Response(serialize_user(user), status=201)

    users = User.objects.all().order_by('id')
    return Response([serialize_user(user) for user in users])


@api_view(['PATCH'])
@permission_classes([AdminOnly])
def admin_user_detail_view(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'detail': 'Uzytkownik nie istnieje.'}, status=404)

    if user.is_superuser and user.id != request.user.id:
        return Response({'detail': 'Nie mozna zmieniac innego superusera.'}, status=403)

    role = request.data.get('rola')
    if role is not None:
        valid_roles = {choice[0] for choice in User.ROLA}
        if role not in valid_roles:
            return Response({'detail': 'Nieprawidlowa rola.'}, status=400)
        user.rola = role
        user.is_staff = role in ('urzednik', 'admin') or user.is_superuser

    status_konta = request.data.get('status_konta')
    if status_konta is not None:
        valid_statuses = {choice[0] for choice in User.STATUS_KONTA}
        if status_konta not in valid_statuses:
            return Response({'detail': 'Nieprawidlowy status konta.'}, status=400)
        user.status_konta = status_konta
        user.is_active = status_konta == 'aktywny'

    if 'czy_zweryfikowany' in request.data:
        user.czy_zweryfikowany = bool(request.data.get('czy_zweryfikowany'))

    if 'is_active' in request.data:
        user.is_active = bool(request.data.get('is_active'))

    user.save()
    return Response(serialize_user(user))
