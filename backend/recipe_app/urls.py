"""
URL configuration for recipe_app project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.generic import TemplateView

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
    path('api-root/', api_root),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('recipes.urls')),
]

# Serve media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve React app - must be last to catch all remaining routes
urlpatterns += [
    re_path(r'^.*', TemplateView.as_view(template_name='index.html')),
]
