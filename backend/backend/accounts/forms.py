from django.shortcuts import render , redirect 
from django.contrib.auth import login , logout , authenticate 
from django.contrib.auth.decorators import login_required 
from django.contrib import messages
from .forms import RegistrationForm   , LoginForm


def register_view(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  
            messages.success(request, 'Konto zostało utworzone!')
            return redirect('dashboard')
    else:
        form = RegistrationForm()
    return render(request, 'auth/register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Nieprawidłowy login lub hasło.')
    else:
        form = LoginForm()
    return render(request, 'auth/login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
def dashboard_view(request):
    return render(request, 'auth/dashboard.html')