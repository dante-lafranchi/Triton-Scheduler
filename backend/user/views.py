from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
import json

# Create your views here.

def check_authentication(request):
    if request.user.is_authenticated:
        return JsonResponse({'authenticated': True}, status=200)
    else:
        return JsonResponse({'authenticated': False}, status=200)

def user_login(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({'success': True}, status=200)
        else:
            existing_user = User.objects.filter(username=username).first()

            if existing_user:
                return JsonResponse({'error': 'Incorrect password'}, status=400)
            else:
                return JsonResponse({'error': 'Username does not exist'}, status=400)
    else:
        return JsonResponse({'error': 'Must be POST request'}, status=400)

def signup(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        username = data.get('username')
        password = data.get('password')

        existing_user = User.objects.filter(username=username).first()

        if existing_user:
            return JsonResponse({'error': 'Username already exists'}, status=400)
        else:
            user = User.objects.create_user(username=username, password=password)
            login(request, user)
            return JsonResponse({'success': True}, status=200)
    else:
        return JsonResponse({'error': 'Must be POST request'}, status=400)