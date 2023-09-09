from django.urls import path
from django.contrib.auth.views import LogoutView

from . import views

urlpatterns = [
    path('check_authentication', views.check_authentication, name='check_authentication'),
    path('login', views.user_login, name='user_login'),
    path('signup', views.signup, name='signup'),
    path('get_csrf', views.get_csrf, name='get_csrf'),
    path('logout', LogoutView.as_view(), name='logout')
]