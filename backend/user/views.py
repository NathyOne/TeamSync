from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView, RetrieveAPIView
from rest_framework.permissions import BasePermission, IsAuthenticated
from .serializers import createUserSerializer
from .models import User
from app.models import AuditLog

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

    def perform_update(self, serializer):
        user = self.get_object()
        previous_role = user.role
        previous_badge = getattr(user, "badge", "BASIC")
        updated_user = serializer.save()
        actor = (
            self.request.user
            if self.request and getattr(self.request, "user", None) and self.request.user.is_authenticated
            else None
        )
        if previous_role != updated_user.role:
            AuditLog.objects.create(
                event_type=AuditLog.ROLE_CHANGE,
                actor=actor,
                target_user=updated_user,
                metadata={"from": previous_role, "to": updated_user.role},
            )
        if previous_badge != updated_user.badge:
            AuditLog.objects.create(
                event_type=AuditLog.BADGE_CHANGE,
                actor=actor,
                target_user=updated_user,
                metadata={"from": previous_badge, "to": updated_user.badge},
            )


class CurrentUserView(RetrieveAPIView):
    serializer_class = createUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
