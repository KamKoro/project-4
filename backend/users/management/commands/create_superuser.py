from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser for development'

    def handle(self, *args, **options):
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(
                self.style.WARNING('Superuser already exists.')
            )
            return

        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created superuser: {user.username}')
        )
        self.stdout.write('Email: admin@example.com')
        self.stdout.write('Password: admin123')
