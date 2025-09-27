from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from Names.views import (
    register_view, login_view, CookieTokenRefreshView,
    TokenBlacklistView, GoogleAuthView
)

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/', include('Names.urls')),
    path('api/register/', register_view, name='register'),
    path('api/auth/', include('dj_rest_auth.urls')),           # login, logout
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),  # signup
    path('api/login/', login_view, name='login'),
    path('api/auth/google/', GoogleAuthView.as_view(), name='google_auth'),
    path('api/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
  
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)