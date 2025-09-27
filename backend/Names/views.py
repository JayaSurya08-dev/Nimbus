from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.core.cache import cache
from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate, login, logout




User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password are required"}, status=400)

    user = authenticate(request, username=email, password=password)
    if not user:
        return Response({"error": "Invalid credentials"}, status=401)

    refresh = RefreshToken.for_user(user)

    response = Response({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "name": user.get_full_name()
        }
    })

    # Set cookies
    response.set_cookie(
        key="access_token",
        value=str(refresh.access_token),
        httponly=True,
        secure=True,       # True in production (HTTPS)
        samesite="Lax",
        max_age=60*5       # 5 minutes
    )
    response.set_cookie(
        key="refresh_token",
        value=str(refresh),
        httponly=True,
        secure=True,
        samesite="Lax",
        max_age=60*60*24*7  # 7 days
    )

    return response



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email
    })



class TokenBlacklistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"detail": "Successfully logged out."}, status=205)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get("refresh_token")
        if not refresh:
            return Response({"error": "Refresh token missing"}, status=401)

        serializer = self.get_serializer(data={"refresh": refresh})
        serializer.is_valid(raise_exception=True)
        access_token = serializer.validated_data["access"]

        response = Response({"message": "Token refreshed"})
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="Lax",
            max_age=60*5
        )
        return response


class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "No user found with this email"}, status=404)

        token = get_random_string(length=32)
        cache.set(token, user.username, timeout=15*60)  # 15 min token validity

        reset_link = f"http://localhost:5173/reset-password/{token}"
        send_mail(
            'Password Reset Request',
            f'Click the link to reset your password: {reset_link}',
            'no-reply@cloudstorage.com',
            [email],
            fail_silently=False,
        )
        return Response({"message": "Reset link sent"}, status=200)

class ResetPasswordView(APIView):
    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        username = cache.get(token)
        if not username:
            return Response({"error": "Invalid or expired token"}, status=400)

        user = User.objects.get(username=username)
        user.set_password(new_password)
        user.save()
        cache.delete(token)
        return Response({"message": "Password has been reset successfully"})


class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        credential = request.data.get("credential")
        if not credential:
            return Response({"error": "No credential provided"}, status=400)

        try:
            idinfo = id_token.verify_oauth2_token(credential, requests.Request(), settings.GOOGLE_CLIENT_ID)
            email = idinfo.get("email")
            name = idinfo.get("name", "")

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": name.split()[0] if name else '',
                    "last_name": ' '.join(name.split()[1:]) if len(name.split()) > 1 else ''
                }
            )

            refresh = RefreshToken.for_user(user)
            response = Response({
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "name": user.get_full_name()
                }
            })

            # Set cookies
            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                httponly=True,
                secure=True,
                samesite="Lax",
                max_age=60*5
            )
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=True,
                samesite="Lax",
                max_age=60*60*24*7
            )

            return response

        except Exception as e:
            return Response({"error": str(e)}, status=400)