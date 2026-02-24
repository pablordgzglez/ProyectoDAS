from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView
from ai.llm_service import call_llm

class HealthcheckView(APIView):
    @extend_schema(
        description="Healthcheck endpoint",
        responses={200: "API is running"},
    )
    def get(self, request):
        params = [{'role':'user','content':"2+2"}]
        return Response(call_llm(params))