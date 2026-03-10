from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView
from .serializers import createUserSerializer
from .models import User

# Create your views here.

class CreateUserView(ModelViewSet):
    serializer_class = createUserSerializer
    queryset = User.objects.all()
    # permission_classes = User.is_staff


