from .views import CreateUserView
from rest_framework_nested import routers

router = routers.DefaultRouter()

router.register("register", CreateUserView)

urlpatterns = router.urls