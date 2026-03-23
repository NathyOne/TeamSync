import csv
from datetime import timedelta
from django.db.models import Count, DecimalField, F, Sum, Value
from django.db.models.functions import Coalesce, TruncDate
from django.utils import timezone
from django.http import HttpResponse
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from django.contrib.auth import get_user_model
from .models import AuditLog, Product, SalesAssignment, SalesDeposit, StockMovement
from .serializers import (
    AcceptStockSerializer,
    AssignStockSerializer,
    AuditLogSerializer,
    ProductSerializer,
    RejectStockSerializer,
    ReturnStockSerializer,
    SalesAssignmentSerializer,
    SalesDepositSerializer,
    StockMovementSerializer,
    SubmitSaleSerializer,
)

User = get_user_model()
DECIMAL_ZERO = Value(0, output_field=DecimalField(max_digits=12, decimal_places=2))


class IsAdminRole(BasePermission):
    message = "Only admin users can perform this action."

    def has_permission(self, request, view):
        role = str(getattr(request.user, "role", "")).upper()
        return bool(
            request.user
            and request.user.is_authenticated
            and role == "ADMIN"
        )


class IsSalesRole(BasePermission):
    message = "Only sales users can perform this action."

    def has_permission(self, request, view):
        role = str(getattr(request.user, "role", "")).upper()
        return bool(
            request.user
            and request.user.is_authenticated
            and role == "SALES"
        )


class ProductView(ModelViewSet):
    queryset = Product.objects.all().order_by("id")
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminRole()]


class AssignStockView(CreateAPIView):
    serializer_class = AssignStockSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        response_data = SalesAssignmentSerializer(assignment).data
        return Response(response_data, status=status.HTTP_201_CREATED)


class ReturnStockView(CreateAPIView):
    serializer_class = ReturnStockSerializer
    permission_classes = [IsAuthenticated, IsSalesRole]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        response_data = SalesAssignmentSerializer(assignment).data
        return Response(response_data, status=status.HTTP_200_OK)


class SubmitSaleView(CreateAPIView):
    serializer_class = SubmitSaleSerializer
    permission_classes = [IsAuthenticated, IsSalesRole]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        deposit = serializer.save()
        response_data = SalesDepositSerializer(deposit).data
        return Response(response_data, status=status.HTTP_201_CREATED)


class SalesAssignmentListView(ListAPIView):
    queryset = SalesAssignment.objects.select_related("salesperson", "product").order_by(
        "id"
    )
    serializer_class = SalesAssignmentSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

class SalesAssignmentSelfListView(ListAPIView):
    serializer_class = SalesAssignmentSerializer
    permission_classes = [IsAuthenticated, IsSalesRole]

    def get_queryset(self):
        return SalesAssignment.objects.select_related("salesperson", "product").filter(
            salesperson=self.request.user
        ).order_by("id")


class AcceptStockView(CreateAPIView):
    serializer_class = AcceptStockSerializer
    permission_classes = [IsAuthenticated, IsSalesRole]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        response_data = SalesAssignmentSerializer(assignment).data
        return Response(response_data, status=status.HTTP_200_OK)


class RejectStockView(CreateAPIView):
    serializer_class = RejectStockSerializer
    permission_classes = [IsAuthenticated, IsSalesRole]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        response_data = SalesAssignmentSerializer(assignment).data
        return Response(response_data, status=status.HTTP_200_OK)


class StockMovementListView(ListAPIView):
    queryset = StockMovement.objects.select_related(
        "product", "salesperson", "created_by"
    )
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class SalesDepositListView(ListAPIView):
    queryset = SalesDeposit.objects.select_related("salesperson", "product").order_by("-created_at")
    serializer_class = SalesDepositSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class SalesDepositSelfListView(ListAPIView):
    serializer_class = SalesDepositSerializer
    permission_classes = [IsAuthenticated, IsSalesRole]

    def get_queryset(self):
        return SalesDeposit.objects.select_related("salesperson", "product").filter(
            salesperson=self.request.user
        ).order_by("-created_at")


class AuditLogListView(ListAPIView):
    queryset = AuditLog.objects.select_related(
        "actor",
        "target_user",
        "product",
        "assignment",
        "deposit",
    )
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class AdminAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, *args, **kwargs):
        assignment_totals = SalesAssignment.objects.aggregate(
            total_sold=Coalesce(Sum("total_sold"), 0),
            total_returned=Coalesce(Sum("total_returned"), 0),
            active_assigned=Coalesce(Sum("quantity"), 0),
            total_assigned=Coalesce(Sum("total_assigned"), 0),
        )
        total_sold = int(assignment_totals["total_sold"] or 0)
        total_returned = int(assignment_totals["total_returned"] or 0)
        active_assigned = int(assignment_totals["active_assigned"] or 0)
        total_assigned = int(assignment_totals["total_assigned"] or 0)

        active_salespeople = (
            SalesAssignment.objects.filter(quantity__gt=0)
            .values("salesperson")
            .distinct()
            .count()
        )
        low_stock_count = Product.objects.filter(
            quantity__gt=0,
            quantity__lte=F("reorder_threshold"),
        ).count()
        total_products = Product.objects.count()
        deposit_totals = SalesDeposit.objects.aggregate(
            total_amount=Coalesce(Sum("total_amount"), DECIMAL_ZERO),
            total_quantity=Coalesce(Sum("quantity"), 0),
            total_count=Coalesce(Count("id"), 0),
        )

        total_amount = float(deposit_totals["total_amount"] or 0)
        total_deposits = int(deposit_totals["total_count"] or 0)
        returns_rate = (
            round((total_returned / (total_sold + total_returned)) * 100, 2)
            if total_sold + total_returned > 0
            else 0
        )

        top_products = list(
            SalesAssignment.objects.values(name=F("product__name"))
            .annotate(sold=Coalesce(Sum("total_sold"), 0))
            .order_by("-sold")[:5]
        )
        top_salespeople = list(
            SalesAssignment.objects.values(name=F("salesperson__email"))
            .annotate(sold=Coalesce(Sum("total_sold"), 0))
            .order_by("-sold")[:5]
        )

        bank_label_map = dict(SalesDeposit.BANK_CHOICES)
        bank_mix = []
        for row in (
            SalesDeposit.objects.values("bank_name")
            .annotate(
                count=Coalesce(Count("id"), 0),
                amount=Coalesce(Sum("total_amount"), DECIMAL_ZERO),
            )
            .order_by("-amount")
        ):
            bank_mix.append(
                {
                    "label": bank_label_map.get(row["bank_name"], row["bank_name"]),
                    "count": int(row["count"] or 0),
                    "amount": float(row["amount"] or 0),
                }
            )

        today = timezone.localdate()
        start_date = today - timedelta(days=6)
        movement_rows = (
            StockMovement.objects.filter(created_at__date__gte=start_date)
            .annotate(day=TruncDate("created_at"))
            .values("day", "movement_type")
            .annotate(total=Coalesce(Sum("quantity"), 0))
        )
        movement_map = {}
        for row in movement_rows:
            day_key = row["day"].isoformat()
            movement_map.setdefault(day_key, {"ASSIGN": 0, "RETURN": 0})
            movement_map[day_key][row["movement_type"]] = int(row["total"] or 0)

        activity_trend = []
        for offset in range(7):
            day = start_date + timedelta(days=offset)
            key = day.isoformat()
            activity_trend.append(
                {
                    "date": key,
                    "assigned": movement_map.get(key, {}).get("ASSIGN", 0),
                    "returned": movement_map.get(key, {}).get("RETURN", 0),
                }
            )

        recent_audits = AuditLog.objects.select_related(
            "actor",
            "target_user",
            "product",
            "assignment",
            "deposit",
        )[:8]

        return Response(
            {
                "totals": {
                    "total_sold": total_sold,
                    "total_returned": total_returned,
                    "active_assigned": active_assigned,
                    "total_assigned": total_assigned,
                    "active_salespeople": active_salespeople,
                    "low_stock_count": low_stock_count,
                    "total_products": total_products,
                    "total_deposits": total_deposits,
                    "total_amount": total_amount,
                    "returns_rate": returns_rate,
                },
                "top_products": top_products,
                "top_salespeople": top_salespeople,
                "sales_mix": [
                    {"label": "Sold", "value": total_sold},
                    {"label": "Returned", "value": total_returned},
                    {"label": "Active", "value": active_assigned},
                ],
                "bank_mix": bank_mix,
                "activity_trend": activity_trend,
                "recent_audits": AuditLogSerializer(recent_audits, many=True).data,
            }
        )


class SalesAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsSalesRole]

    def get(self, request, *args, **kwargs):
        assignments = SalesAssignment.objects.filter(salesperson=request.user)
        deposits = SalesDeposit.objects.filter(salesperson=request.user)

        totals = assignments.aggregate(
            total_assigned=Coalesce(Sum("total_assigned"), 0),
            total_sold=Coalesce(Sum("total_sold"), 0),
            total_returned=Coalesce(Sum("total_returned"), 0),
            active_assigned=Coalesce(Sum("quantity"), 0),
        )
        total_assigned = int(totals["total_assigned"] or 0)
        total_sold = int(totals["total_sold"] or 0)
        total_returned = int(totals["total_returned"] or 0)
        active_assigned = int(totals["active_assigned"] or 0)

        pending_acceptance = assignments.filter(is_accepted=False, quantity__gt=0).count()
        deposit_totals = deposits.aggregate(
            total_amount=Coalesce(Sum("total_amount"), DECIMAL_ZERO),
            total_count=Coalesce(Count("id"), 0),
        )
        total_amount = float(deposit_totals["total_amount"] or 0)

        product_mix = list(
            assignments.values(name=F("product__name"))
            .annotate(sold=Coalesce(Sum("total_sold"), 0))
            .order_by("-sold")[:5]
        )

        bank_label_map = dict(SalesDeposit.BANK_CHOICES)
        bank_mix = []
        for row in (
            deposits.values("bank_name")
            .annotate(
                count=Coalesce(Count("id"), 0),
                amount=Coalesce(Sum("total_amount"), DECIMAL_ZERO),
            )
            .order_by("-amount")
        ):
            bank_mix.append(
                {
                    "label": bank_label_map.get(row["bank_name"], row["bank_name"]),
                    "count": int(row["count"] or 0),
                    "amount": float(row["amount"] or 0),
                }
            )

        returns_rate = (
            round((total_returned / (total_sold + total_returned)) * 100, 2)
            if total_sold + total_returned > 0
            else 0
        )

        return Response(
            {
                "totals": {
                    "total_assigned": total_assigned,
                    "total_sold": total_sold,
                    "total_returned": total_returned,
                    "active_assigned": active_assigned,
                    "pending_acceptance": pending_acceptance,
                    "total_amount": total_amount,
                    "returns_rate": returns_rate,
                },
                "sales_mix": [
                    {"label": "Sold", "value": total_sold},
                    {"label": "Active", "value": active_assigned},
                    {"label": "Returned", "value": total_returned},
                ],
                "top_products": product_mix,
                "bank_mix": bank_mix,
            }
        )


class CompanyOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        role_counts = list(
            User.objects.values("role").annotate(count=Count("id")).order_by("role")
        )
        total_users = sum(item["count"] for item in role_counts)
        total_products = Product.objects.count()
        low_stock_count = Product.objects.filter(
            quantity__gt=0,
            quantity__lte=F("reorder_threshold"),
        ).count()
        total_sold = SalesAssignment.objects.aggregate(
            total=Coalesce(Sum("total_sold"), 0)
        )["total"]
        total_amount = SalesDeposit.objects.aggregate(
            total=Coalesce(Sum("total_amount"), DECIMAL_ZERO)
        )["total"]

        recent_audits = AuditLog.objects.select_related(
            "actor",
            "target_user",
            "product",
        )[:5]

        return Response(
            {
                "totals": {
                    "total_users": int(total_users),
                    "total_products": int(total_products),
                    "low_stock_count": int(low_stock_count),
                    "total_sold": int(total_sold or 0),
                    "total_amount": float(total_amount or 0),
                },
                "role_counts": role_counts,
                "recent_activity": AuditLogSerializer(recent_audits, many=True).data,
            }
        )


class SalesAssignmentExportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, *args, **kwargs):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="sales_assignments.csv"'
        writer = csv.writer(response)
        writer.writerow(
            [
                "Salesperson",
                "Product",
                "Quantity",
                "Total Assigned",
                "Total Returned",
                "Total Sold",
                "Accepted",
                "Updated At",
            ]
        )
        assignments = SalesAssignment.objects.select_related("salesperson", "product").order_by("id")
        for assignment in assignments:
            writer.writerow(
                [
                    assignment.salesperson.email,
                    assignment.product.name,
                    assignment.quantity,
                    assignment.total_assigned,
                    assignment.total_returned,
                    assignment.total_sold,
                    "Yes" if assignment.is_accepted else "No",
                    assignment.updated_at.isoformat(),
                ]
            )
        return response


class SalesDepositExportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, *args, **kwargs):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="sales_deposits.csv"'
        writer = csv.writer(response)
        writer.writerow(
            [
                "Salesperson",
                "Product",
                "Quantity",
                "Unit Price",
                "Total Amount",
                "Bank",
                "Created At",
            ]
        )
        deposits = SalesDeposit.objects.select_related("salesperson", "product").order_by("-created_at")
        for deposit in deposits:
            writer.writerow(
                [
                    deposit.salesperson.email,
                    deposit.product.name,
                    deposit.quantity,
                    deposit.unit_price,
                    deposit.total_amount,
                    deposit.get_bank_name_display(),
                    deposit.created_at.isoformat(),
                ]
            )
        return response
