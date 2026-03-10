from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView
from rest_framework.permissions import BasePermission, IsAuthenticated
from .serializers import createUserSerializer
from .models import User

# Create your views here.

class IsAdminRole(BasePermission):
    message = "Only admin users can perform this action."

    def has_permission(self, request, view):
        role = str(getattr(request.user, "role", "")).upper()
        return bool(request.user and request.user.is_authenticated and role == "ADMIN")

class CreateUserView(ModelViewSet):
    serializer_class = createUserSerializer
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdminRole]

