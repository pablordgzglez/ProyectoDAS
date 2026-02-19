from django.contrib.auth.models import User
from rest_framework import serializers
import re
from rest_framework_simplejwt.tokens import RefreshToken
from chat.models import Usage
from django.utils import timezone


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate(self, data):
        p1 = data.get("password1")
        p2 = data.get("password2")

        if p1 != p2:
            raise serializers.ValidationError({"password2": "Passwords do not match."})

        if len(p1) < 8:
            raise serializers.ValidationError({"password1": "Password must be at least 8 characters."})

        if not re.search(r"[A-Z]", p1):
            raise serializers.ValidationError({"password1": "Password must contain at least one uppercase letter."})

        if not re.search(r"[a-z]", p1):
            raise serializers.ValidationError({"password1": "Password must contain at least one lowercase letter."})

        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password1"],
        )

        # Crear Usage automáticamente
        Usage.objects.get_or_create(
            user=user,
            defaults={
                "messages_used": 0,
                "messages_limit": 20,   # ajusta si queréis otro default
                "reset_date": timezone.now().date(),
            },
        )

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email"]
        read_only_fields = ["username"]  # si quieres permitir cambiar username, quita esto


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate(self, data):
        p1 = data.get("password1")
        p2 = data.get("password2")

        if p1 != p2:
            raise serializers.ValidationError({"password2": "Passwords do not match."})

        if len(p1) < 8:
            raise serializers.ValidationError({"password1": "Password must be at least 8 characters."})

        if not re.search(r"[A-Z]", p1):
            raise serializers.ValidationError({"password1": "Password must contain at least one uppercase letter."})

        if not re.search(r"[a-z]", p1):
            raise serializers.ValidationError({"password1": "Password must contain at least one lowercase letter."})

        return data
    
    
    
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.validated_data["refresh"])
            token.blacklist()
        except Exception:
            raise serializers.ValidationError({"refresh": "Invalid or expired token."})