from .views import CreateUserView, CurrentUserView
from rest_framework_nested import routers
from django.urls import path

router = routers.DefaultRouter()

router.register("register", CreateUserView)

urlpatterns = [
    path("me/", CurrentUserView.as_view(), name="user-me"),
    *router.urls,
]
