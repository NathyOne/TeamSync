from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Product, SalesAssignment, SalesDeposit, StockMovement
from .serializers import (
    AcceptStockSerializer,
    AssignStockSerializer,
    ProductSerializer,
    RejectStockSerializer,
    ReturnStockSerializer,
    SalesAssignmentSerializer,
    SalesDepositSerializer,
    StockMovementSerializer,
    SubmitSaleSerializer,
)


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
    permission_classes = [IsAuthenticated]


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
