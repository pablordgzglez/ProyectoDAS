import calendar
from django.utils import timezone
from django.db import transaction

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ai.llm_service import call_llm, SYS_PROMPT
from .models import Chat, ChatMessage, Usage
from .serializers import ChatSerializer, ChatMessageSerializer, UsageSerializer


def add_one_month(d):
    # d es datetime.date
    year = d.year
    month = d.month + 1
    if month == 13:
        month = 1
        year += 1
    last_day = calendar.monthrange(year, month)[1]
    day = min(d.day, last_day)
    return d.replace(year=year, month=month, day=day)


class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], url_path="message")
    def send_message(self, request, pk=None):
        """
        POST /api/chats/{id}/message/
        body: { "content": "hola" }

        - valida límite mensual (Usage)
        - guarda mensaje user
        - llama al LLM con el historial
        - guarda respuesta system
        - incrementa usage
        """
        chat = self.get_object()
        content = (request.data.get("content") or "").strip()
        if not content:
            return Response({"detail": "content is required"}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        today = now.date()

        with transaction.atomic():
            usage, _ = Usage.objects.get_or_create(user=request.user)

            # Reset mensual si toca
            reset_date = usage.reset_date.date() if hasattr(usage.reset_date, "date") else usage.reset_date
            if today > reset_date:
                usage.messages_used = 0
                usage.reset_date = add_one_month(today)
                usage.save(update_fields=["messages_used", "reset_date"])

            # Bloqueo por límite
            if usage.messages_used >= usage.messages_limit:
                return Response(
                    {"detail": "Monthly message limit exceeded"},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

            # Guardar mensaje del usuario
            ChatMessage.objects.create(chat=chat, role="user", content=content)

            # Construir historial para el LLM (incluye system prompt)
            history = list(
                chat.messages.order_by("created_at").values("role", "content")
            )
            llm_messages = SYS_PROMPT + history

            # Llamada al modelo
            assistant_reply = call_llm(llm_messages)

            # Guardar respuesta del sistema/LLM
            ChatMessage.objects.create(chat=chat, role="system", content=assistant_reply)

            # Incrementar usage (solo por mensaje del usuario)
            usage.messages_used += 1
            usage.save(update_fields=["messages_used"])

        return Response(
            {"reply": assistant_reply, "messages_used": usage.messages_used, "messages_limit": usage.messages_limit},
            status=status.HTTP_201_CREATED,
        )


class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Solo mensajes de chats del usuario
        return ChatMessage.objects.filter(chat__user=self.request.user).order_by("created_at")

    def perform_create(self, serializer):
        # Si alguien intenta crear mensajes manualmente por /api/messages/
        # forzamos role=user y verificamos que el chat es suyo
        chat = serializer.validated_data["chat"]
        if chat.user != self.request.user:
            raise PermissionError("Not your chat")
        serializer.save(role="user")


class UsageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UsageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Solo el usage del usuario
        return Usage.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
