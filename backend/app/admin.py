from django.contrib import admin
from .models import Product, SalesAssignment, SalesDeposit, StockMovement


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "quantity", "price", "reorder_threshold")
    search_fields = ("name",)


@admin.register(SalesAssignment)
class SalesAssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "salesperson",
        "product",
        "quantity",
        "total_assigned",
        "total_returned",
        "updated_at",
    )
    search_fields = ("salesperson__email", "product__name")
    list_filter = ("product",)


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "movement_type",
        "product",
        "salesperson",
        "quantity",
        "created_by",
        "created_at",
    )
    search_fields = ("salesperson__email", "product__name", "created_by__email")
    list_filter = ("movement_type", "product")


@admin.register(SalesDeposit)
class SalesDepositAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "salesperson",
        "product",
        "quantity",
        "unit_price",
        "total_amount",
        "bank_name",
        "created_at",
    )
    search_fields = ("salesperson__email", "product__name", "bank_name")
    list_filter = ("bank_name",)
