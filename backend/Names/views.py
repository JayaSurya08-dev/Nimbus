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



User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    return Response({'message': 'User created', 'username': user.username}, status=status.HTTP_201_CREATED)


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
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except KeyError:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        except TokenError:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

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
        print("📥 Incoming data:", request.data) 
        credential = request.data.get("credential")
        if not credential:
            return Response({"error": "No credential provided"}, status=400)

        try:
            # Verify token
            idinfo = id_token.verify_oauth2_token(
                credential,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            print("✅ Google token verified:", idinfo)

            email = idinfo.get("email")
            name = idinfo.get("name", "")

            if not email:
                return Response({"error": "Email not available"}, status=400)

            # Create or get user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": name.split()[0] if name else '',
                    "last_name": ' '.join(name.split()[1:]) if len(name.split()) > 1 else ''
                }
            )

            # Issue JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.get_full_name(),
                    "username": user.username
                },
            })

        except Exception as e:
            print("❌ Google auth error:", e)
            try:
                unverified = id_token.verify_oauth2_token(credential, requests.Request())
                print("🔍 Token audience:", unverified.get("aud"))
                print("🔍 Expected client ID:", settings.GOOGLE_CLIENT_ID)
            except Exception:
                print("⚠️ Could not even decode token")
            return Response({"error": str(e)}, status=400)
