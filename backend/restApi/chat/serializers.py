from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Chat, ChatMessage, Usage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "chat", "role", "content", "created_at"]
        read_only_fields = ["id", "created_at"]


class ChatSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ["id", "user", "title", "created_at", "messages"]
        read_only_fields = ["id", "created_at"]


class UsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usage
        fields = ["id", "user", "messages_used", "messages_limit", "reset_date"]
        read_only_fields = ["id"]
