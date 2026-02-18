from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Chat, ChatMessage, Usage
from .serializers import ChatSerializer, ChatMessageSerializer, UsageSerializer


class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all().order_by("-created_at")
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]


class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all().order_by("created_at")
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]


class UsageViewSet(viewsets.ModelViewSet):
    queryset = Usage.objects.all()
    serializer_class = UsageSerializer
    permission_classes = [IsAuthenticated]
