from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView, RetrieveAPIView
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


class CurrentUserView(RetrieveAPIView):
    serializer_class = createUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
