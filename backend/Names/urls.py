from django.urls import path
from .views import register_view,profile

urlpatterns = [
    path('profile/',profile,name='profile'),
]