"""
WSGI config for recipe_app project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'recipe_app.settings')

application = get_wsgi_application()
