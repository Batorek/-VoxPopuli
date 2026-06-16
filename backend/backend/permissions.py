
from rest_framework.permissions import BasePermission

class TylkoZweryfikowanyMieszkaniec(BasePermission):
    """
    Ochroniarz, który wpuszcza tylko zalogowanych użytkowników 
    z rolą 'mieszkaniec' i zweryfikowanym kontem.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        czy_mieszkaniec = getattr(request.user, 'rola', '') == 'mieszkaniec'
        czy_zweryfikowany = getattr(request.user, 'czy_zweryfikowany', False)

        return czy_mieszkaniec and czy_zweryfikowany