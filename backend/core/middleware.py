from django.conf import settings
from django.http import HttpResponse
from urllib.parse import urlparse


class DevCorsMiddleware:
    """Minimal CORS middleware for local frontend-backend development."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.headers.get('Origin')
        allowed_origins = set(getattr(settings, 'CORS_ALLOWED_ORIGINS', []))
        allow_localhost = False

        if origin and getattr(settings, 'DEBUG', False):
            parsed_origin = urlparse(origin)
            allow_localhost = parsed_origin.hostname in {'localhost', '127.0.0.1'}

        if request.method == 'OPTIONS':
            response = HttpResponse(status=200)
        else:
            response = self.get_response(request)

        if origin and (origin in allowed_origins or allow_localhost):
            requested_headers = request.headers.get(
                'Access-Control-Request-Headers',
                'Authorization, Content-Type, X-CSRFToken',
            )
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = requested_headers
            response['Vary'] = 'Origin'

        return response
