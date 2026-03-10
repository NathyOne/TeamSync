from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role  # optional: puts role inside JWT claims
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = self.user.role  # adds role in login response body
        return data


class createUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, trim_whitespace=False)

    class Meta:
        model = get_user_model()
        fields = ['id', 'email', 'password', 'role', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True},
            'created_at': {'read_only': True},
        }

    def create(self, validated_data):
        return get_user_model().objects.create_user(**validated_data)
