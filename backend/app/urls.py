from django.urls import path
from rest_framework_nested import routers
from .views import (
    AcceptStockView,
    AssignStockView,
    ProductView,
    RejectStockView,
    ReturnStockView,
    SalesAssignmentListView,
    SalesAssignmentSelfListView,
    SalesDepositListView,
    SubmitSaleView,
    StockMovementListView,
)

router = routers.DefaultRouter()

router.register("products", ProductView)

urlpatterns = router.urls + [
    path("stock/assign/", AssignStockView.as_view(), name="stock-assign"),
    path("stock/return/", ReturnStockView.as_view(), name="stock-return"),
    path("stock/sold/", SubmitSaleView.as_view(), name="stock-sold"),
    path("stock/accept/", AcceptStockView.as_view(), name="stock-accept"),
    path("stock/reject/", RejectStockView.as_view(), name="stock-reject"),
    path(
        "stock/assignments/",
        SalesAssignmentListView.as_view(),
        name="stock-assignment-list",
    ),
    path(
        "stock/my-assignments/",
        SalesAssignmentSelfListView.as_view(),
        name="stock-assignment-self-list",
    ),
    path("stock/movements/", StockMovementListView.as_view(), name="stock-movement-list"),
    path("stock/deposits/", SalesDepositListView.as_view(), name="stock-deposit-list"),
]
