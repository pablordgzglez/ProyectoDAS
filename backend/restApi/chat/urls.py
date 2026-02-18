from rest_framework.routers import DefaultRouter

from .views import ChatMessageViewSet, ChatViewSet, UsageViewSet

router = DefaultRouter()
router.register(r"chats", ChatViewSet)
router.register(r"messages", ChatMessageViewSet)
router.register(r"usage", UsageViewSet)

urlpatterns = router.urls
