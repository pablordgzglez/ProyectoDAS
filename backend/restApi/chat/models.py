from django.conf import settings
from django.db import models
from django.utils import timezone


class Usage(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="usage")
    messages_used = models.PositiveIntegerField(default=0)
    messages_limit = models.PositiveIntegerField(default=20)
    reset_date = models.DateField(default=timezone.now)


class Chat(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chats")
    title = models.CharField(max_length=255, default="New chat")
    created_at = models.DateTimeField(auto_now_add=True)


class ChatMessage(models.Model):
    ROLE_CHOICES = (("system", "system"), ("user", "user"))

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
