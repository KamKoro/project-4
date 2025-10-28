from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Delete all users except the admin user'

    def add_arguments(self, parser):
        parser.add_argument(
            '--admin-username',
            type=str,
            default='admin',
            help='Username of the admin user to keep (default: admin)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )

    def handle(self, *args, **options):
        admin_username = options['admin_username']
        dry_run = options['dry_run']
        
        try:
            # Find the admin user
            admin_user = User.objects.get(username=admin_username)
            self.stdout.write(
                self.style.SUCCESS(f'Found admin user: {admin_user.username} (ID: {admin_user.id})')
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Admin user "{admin_username}" not found!')
            )
            return

        # Get all other users
        other_users = User.objects.exclude(username=admin_username)
        user_count = other_users.count()
        
        if user_count == 0:
            self.stdout.write(
                self.style.SUCCESS('No users to delete. Only admin user exists.')
            )
            return

        self.stdout.write(f'Found {user_count} users to delete:')
        for user in other_users:
            self.stdout.write(f'  - {user.username} (ID: {user.id}) - {user.email or "No email"}')

        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN: No users were actually deleted.')
            )
            return

        # Confirm deletion
        confirm = input(f'\nAre you sure you want to delete {user_count} users? Type "yes" to confirm: ')
        
        if confirm.lower() != 'yes':
            self.stdout.write('Operation cancelled.')
            return

        # Delete users in a transaction
        with transaction.atomic():
            deleted_count = other_users.count()
            other_users.delete()
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully deleted {deleted_count} users.')
            )
            self.stdout.write(
                self.style.SUCCESS(f'Admin user "{admin_username}" was preserved.')
            )
