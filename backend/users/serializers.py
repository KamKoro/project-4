from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        """Meta options for UserRegistrationSerializer."""
        model = User
        fields = (
            'username', 'email', 'first_name', 'last_name', 
            'password', 'password_confirm'
        )

    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        """Create a new user."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data."""
    class Meta:
        """Meta options for UserSerializer."""
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'bio', 'profile_picture', 'date_joined'
        )
        read_only_fields = ('id', 'date_joined')


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        """Validate login credentials."""
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        raise serializers.ValidationError('Must include username and password')

    def create(self, validated_data):
        """Not implemented for login serializer."""
        raise NotImplementedError("LoginSerializer does not support create")

    def update(self, instance, validated_data):
        """Not implemented for login serializer."""
        raise NotImplementedError("LoginSerializer does not support update")
