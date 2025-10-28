"""
URL configuration for recipe_app project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'Recipe App API',
        'version': '1.0',
        'endpoints': {
            'auth': '/api/auth/',
            'recipes': '/api/',
            'admin': '/admin/'
        }
    })

urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('recipes.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
