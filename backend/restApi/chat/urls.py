from django.urls import path
from .views import ChatListCreateView, ChatRetrieveDestroyView, ChatSendMessageView, UsageListView

urlpatterns = [
    path("chats/", ChatListCreateView.as_view(), name="chat-list-create"),
    path("chats/<int:pk>/", ChatRetrieveDestroyView.as_view(), name="chat-detail"),
    path("chats/<int:pk>/message/", ChatSendMessageView.as_view(), name="chat-send-message"),
    path("usage/", UsageListView.as_view(), name="usage-list"),
]
