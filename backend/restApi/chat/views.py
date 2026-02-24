import calendar
from django.utils import timezone
from django.db import transaction

from rest_framework import status, generics, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from ai.llm_service import call_llm, SYS_PROMPT
from .models import Chat, ChatMessage, Usage
from .serializers import ChatSerializer, UsageSerializer


def add_one_month(d):
    year = d.year
    month = d.month + 1
    if month == 13:
        month = 1
        year += 1
    last_day = calendar.monthrange(year, month)[1]
    day = min(d.day, last_day)
    return d.replace(year=year, month=month, day=day)


class ChatListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ChatRetrieveDestroyView(generics.RetrieveDestroyAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(user=self.request.user).order_by("-created_at")


class SendMessageSerializer(serializers.Serializer):
    content = serializers.CharField()


class ChatSendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=SendMessageSerializer)
    def post(self, request, pk: int):
        try:
            chat = Chat.objects.get(pk=pk, user=request.user)
        except Chat.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        content = (request.data.get("content") or "").strip()
        if not content:
            return Response({"detail": "content is required"}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        today = now.date()

        with transaction.atomic():
            usage, _ = Usage.objects.get_or_create(user=request.user)

            reset_date = usage.reset_date.date() if hasattr(usage.reset_date, "date") else usage.reset_date
            if today > reset_date:
                usage.messages_used = 0
                usage.reset_date = add_one_month(today)
                usage.save(update_fields=["messages_used", "reset_date"])

            if usage.messages_used >= usage.messages_limit:
                return Response(
                    {"detail": "Monthly message limit exceeded"},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

            ChatMessage.objects.create(chat=chat, role="user", content=content)

            history = list(chat.messages.order_by("created_at").values("role", "content"))
            llm_messages = SYS_PROMPT + history

            assistant_reply = call_llm(llm_messages)

            ChatMessage.objects.create(chat=chat, role="assistant", content=assistant_reply)

            usage.messages_used += 1
            usage.save(update_fields=["messages_used"])

        return Response(
            {
                "reply": assistant_reply,
                "messages_used": usage.messages_used,
                "messages_limit": usage.messages_limit,
            },
            status=status.HTTP_201_CREATED,
        )


class UsageListView(generics.ListAPIView):
    serializer_class = UsageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Usage.objects.filter(user=self.request.user)
