from rest_framework.permissions import BasePermission, SAFE_METHODS


def user_role(user):
    if not user or not user.is_authenticated:
        return "gosc"
    if getattr(user, "is_superuser", False):
        return "admin"
    return getattr(user, "rola", "gosc") or "gosc"


def is_mieszkaniec(user):
    return user_role(user) == "mieszkaniec"


def is_urzednik(user):
    return user_role(user) == "urzednik"


def is_admin(user):
    return user_role(user) == "admin"


def is_urzednik_or_admin(user):
    return is_urzednik(user) or is_admin(user)


class TylkoZweryfikowanyMieszkaniec(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return is_mieszkaniec(request.user) and getattr(
            request.user,
            "czy_zweryfikowany",
            False,
        )


class MieszkaniecLubTylkoOdczyt(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and is_mieszkaniec(request.user)


class ZalogowanyLubTylkoOdczyt(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class UrzednikLubAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and is_urzednik_or_admin(request.user)
        )


class AdminOnly(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and is_admin(request.user)


class UrzednikAdminLubTylkoOdczyt(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return (
            request.user
            and request.user.is_authenticated
            and is_urzednik_or_admin(request.user)
        )
