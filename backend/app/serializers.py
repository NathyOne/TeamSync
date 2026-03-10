from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import Product, SalesAssignment, SalesDeposit, StockMovement

User = get_user_model()


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "quantity"]


class SalesAssignmentSerializer(serializers.ModelSerializer):
    salesperson_email = serializers.EmailField(
        source="salesperson.email",
        read_only=True,
    )
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = SalesAssignment
        fields = [
            "id",
            "salesperson",
            "salesperson_email",
            "product",
            "product_name",
            "quantity",
            "total_assigned",
            "total_returned",
            "total_sold",
            "is_accepted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "salesperson_email",
            "product_name",
            "total_assigned",
            "total_returned",
            "total_sold",
            "is_accepted",
            "created_at",
            "updated_at",
        ]


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    salesperson_email = serializers.EmailField(
        source="salesperson.email",
        read_only=True,
    )
    created_by_email = serializers.EmailField(
        source="created_by.email",
        read_only=True,
    )

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "product",
            "product_name",
            "salesperson",
            "salesperson_email",
            "movement_type",
            "quantity",
            "created_by",
            "created_by_email",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "product_name",
            "salesperson_email",
            "created_by_email",
            "created_at",
        ]


class AssignStockSerializer(serializers.Serializer):
    salesperson_id = serializers.PrimaryKeyRelatedField(
        source="salesperson",
        queryset=User.objects.filter(role="SALES"),
        write_only=True,
    )
    product_id = serializers.PrimaryKeyRelatedField(
        source="product",
        queryset=Product.objects.all(),
        write_only=True,
    )
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        product = attrs["product"]
        quantity = attrs["quantity"]
        if product.quantity < quantity:
            raise serializers.ValidationError(
                {"quantity": "Not enough stock available for assignment."}
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        salesperson = validated_data["salesperson"]
        product = Product.objects.select_for_update().get(pk=validated_data["product"].pk)
        quantity = validated_data["quantity"]

        if product.quantity < quantity:
            raise serializers.ValidationError(
                {"quantity": "Not enough stock available for assignment."}
            )

        assignment, _ = SalesAssignment.objects.select_for_update().get_or_create(
            salesperson=salesperson,
            product=product,
            defaults={
                "quantity": 0,
                "total_assigned": 0,
                "total_returned": 0,
            },
        )
        assignment.quantity += quantity
        assignment.total_assigned += quantity
        assignment.is_accepted = False
        assignment.save(update_fields=["quantity", "total_assigned", "is_accepted", "updated_at"])

        product.quantity -= quantity
        product.save(update_fields=["quantity"])

        request = self.context.get("request")
        created_by = (
            request.user
            if request and hasattr(request, "user") and request.user.is_authenticated
            else None
        )
        StockMovement.objects.create(
            product=product,
            salesperson=salesperson,
            movement_type=StockMovement.ASSIGN,
            quantity=quantity,
            created_by=created_by,
        )
        return assignment


class ReturnStockSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
        source="product",
        queryset=Product.objects.all(),
        write_only=True,
    )
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        request = self.context.get("request")
        salesperson = getattr(request, "user", None)
        if not salesperson or not salesperson.is_authenticated:
            raise serializers.ValidationError("Authenticated user is required.")

        product = attrs["product"]
        assignment = SalesAssignment.objects.filter(
            salesperson=salesperson,
            product=product,
        ).first()
        if not assignment:
            raise serializers.ValidationError(
                {"product_id": "No stock assignment exists for this product."}
            )
        if assignment.quantity < attrs["quantity"]:
            raise serializers.ValidationError(
                {"quantity": "Return quantity exceeds assigned stock."}
            )

        attrs["salesperson"] = salesperson
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        salesperson = validated_data["salesperson"]
        product = Product.objects.select_for_update().get(pk=validated_data["product"].pk)
        quantity = validated_data["quantity"]

        assignment = SalesAssignment.objects.select_for_update().get(
            salesperson=salesperson,
            product=product,
        )
        if assignment.quantity < quantity:
            raise serializers.ValidationError(
                {"quantity": "Return quantity exceeds assigned stock."}
            )

        assignment.quantity -= quantity
        assignment.total_returned += quantity
        assignment.save(update_fields=["quantity", "total_returned", "updated_at"])

        product.quantity += quantity
        product.save(update_fields=["quantity"])

        request = self.context.get("request")
        created_by = (
            request.user
            if request and hasattr(request, "user") and request.user.is_authenticated
            else None
        )
        StockMovement.objects.create(
            product=product,
            salesperson=salesperson,
            movement_type=StockMovement.RETURN,
            quantity=quantity,
            created_by=created_by,
        )
        return assignment


class SalesDepositSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    salesperson_email = serializers.EmailField(source="salesperson.email", read_only=True)
    bank_display = serializers.CharField(source="get_bank_name_display", read_only=True)

    class Meta:
        model = SalesDeposit
        fields = [
            "id",
            "product",
            "product_name",
            "salesperson",
            "salesperson_email",
            "quantity",
            "bank_name",
            "bank_display",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "product_name",
            "salesperson_email",
            "bank_display",
            "created_at",
        ]


class SubmitSaleSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
        source="product",
        queryset=Product.objects.all(),
        write_only=True,
    )
    bank_name = serializers.ChoiceField(choices=SalesDeposit.BANK_CHOICES)

    def validate(self, attrs):
        request = self.context.get("request")
        salesperson = getattr(request, "user", None)
        if not salesperson or not salesperson.is_authenticated:
            raise serializers.ValidationError("Authenticated user is required.")

        product = attrs["product"]
        assignment = SalesAssignment.objects.filter(
            salesperson=salesperson,
            product=product,
        ).first()
        if not assignment or assignment.quantity == 0:
            raise serializers.ValidationError(
                {"product_id": "No stock assignment exists for this product."}
            )
        if not assignment.is_accepted:
            raise serializers.ValidationError(
                {"product_id": "Assignment must be accepted before submitting sales."}
            )

        attrs["salesperson"] = salesperson
        attrs["assignment"] = assignment
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        salesperson = validated_data["salesperson"]
        assignment = SalesAssignment.objects.select_for_update().get(
            pk=validated_data["assignment"].pk
        )
        product = Product.objects.select_for_update().get(pk=assignment.product.pk)
        quantity = assignment.quantity

        assignment.quantity = 0
        assignment.total_sold += quantity
        assignment.save(update_fields=["quantity", "total_sold", "updated_at"])

        deposit = SalesDeposit.objects.create(
            product=product,
            salesperson=salesperson,
            quantity=quantity,
            bank_name=validated_data["bank_name"],
        )
        return deposit


class AcceptStockSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
        source="product",
        queryset=Product.objects.all(),
        write_only=True,
    )

    def validate(self, attrs):
        request = self.context.get("request")
        salesperson = getattr(request, "user", None)
        if not salesperson or not salesperson.is_authenticated:
            raise serializers.ValidationError("Authenticated user is required.")

        product = attrs["product"]
        assignment = SalesAssignment.objects.filter(
            salesperson=salesperson,
            product=product,
        ).first()
        if not assignment or assignment.quantity == 0:
            raise serializers.ValidationError(
                {"product_id": "No stock assignment exists for this product."}
            )

        attrs["assignment"] = assignment
        return attrs

    def create(self, validated_data):
        assignment = validated_data["assignment"]
        assignment.is_accepted = True
        assignment.save(update_fields=["is_accepted", "updated_at"])
        return assignment


class RejectStockSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
        source="product",
        queryset=Product.objects.all(),
        write_only=True,
    )

    def validate(self, attrs):
        request = self.context.get("request")
        salesperson = getattr(request, "user", None)
        if not salesperson or not salesperson.is_authenticated:
            raise serializers.ValidationError("Authenticated user is required.")

        product = attrs["product"]
        assignment = SalesAssignment.objects.filter(
            salesperson=salesperson,
            product=product,
        ).first()
        if not assignment or assignment.quantity == 0:
            raise serializers.ValidationError(
                {"product_id": "No stock assignment exists for this product."}
            )

        attrs["salesperson"] = salesperson
        attrs["assignment"] = assignment
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        salesperson = validated_data["salesperson"]
        assignment = SalesAssignment.objects.select_for_update().get(
            pk=validated_data["assignment"].pk
        )
        product = Product.objects.select_for_update().get(pk=assignment.product.pk)
        quantity = assignment.quantity

        assignment.quantity = 0
        assignment.total_returned += quantity
        assignment.is_accepted = False
        assignment.save(update_fields=["quantity", "total_returned", "is_accepted", "updated_at"])

        product.quantity += quantity
        product.save(update_fields=["quantity"])

        request = self.context.get("request")
        created_by = (
            request.user
            if request and hasattr(request, "user") and request.user.is_authenticated
            else None
        )
        StockMovement.objects.create(
            product=product,
            salesperson=salesperson,
            movement_type=StockMovement.RETURN,
            quantity=quantity,
            created_by=created_by,
        )
        return assignment
        
