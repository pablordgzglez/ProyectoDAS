from rest_framework.routers import DefaultRouter
from .views import ChatViewSet, ChatMessageViewSet, UsageViewSet

router = DefaultRouter()
router.register(r"chats", ChatViewSet, basename="chat")
router.register(r"messages", ChatMessageViewSet, basename="message")
router.register(r"usage", UsageViewSet, basename="usage")

urlpatterns = router.urls
