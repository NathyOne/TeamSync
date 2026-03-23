from django.urls import path
from rest_framework_nested import routers
from .views import (
    AcceptStockView,
    AssignStockView,
    AuditLogListView,
    AdminAnalyticsView,
    CompanyOverviewView,
    ProductView,
    RejectStockView,
    ReturnStockView,
    SalesAssignmentListView,
    SalesAssignmentSelfListView,
    SalesAssignmentExportView,
    SalesDepositListView,
    SalesDepositSelfListView,
    SalesDepositExportView,
    SalesAnalyticsView,
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
        "stock/assignments/export/",
        SalesAssignmentExportView.as_view(),
        name="stock-assignment-export",
    ),
    path(
        "stock/my-assignments/",
        SalesAssignmentSelfListView.as_view(),
        name="stock-assignment-self-list",
    ),
    path("stock/movements/", StockMovementListView.as_view(), name="stock-movement-list"),
    path("stock/deposits/", SalesDepositListView.as_view(), name="stock-deposit-list"),
    path("stock/deposits/export/", SalesDepositExportView.as_view(), name="stock-deposit-export"),
    path("stock/my-deposits/", SalesDepositSelfListView.as_view(), name="stock-deposit-self-list"),
    path("audit-logs/", AuditLogListView.as_view(), name="audit-log-list"),
    path("analytics/admin/", AdminAnalyticsView.as_view(), name="admin-analytics"),
    path("analytics/sales/", SalesAnalyticsView.as_view(), name="sales-analytics"),
    path("analytics/overview/", CompanyOverviewView.as_view(), name="company-overview"),
]
