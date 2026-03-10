from django.conf import settings
from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=50)
    quantity = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reorder_threshold = models.PositiveIntegerField(default=10)

    def __str__(self):
        return self.name


class SalesAssignment(models.Model):
    salesperson = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sales_assignments",
        limit_choices_to={"role": "SALES"},
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="sales_assignments",
    )
    quantity = models.PositiveIntegerField(default=0)
    total_assigned = models.PositiveIntegerField(default=0)
    total_returned = models.PositiveIntegerField(default=0)
    total_sold = models.PositiveIntegerField(default=0)
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["salesperson", "product"],
                name="unique_salesperson_product_assignment",
            ),
        ]

    def __str__(self):
        return f"{self.salesperson} - {self.product} ({self.quantity})"


class StockMovement(models.Model):
    ASSIGN = "ASSIGN"
    RETURN = "RETURN"

    MOVEMENT_TYPE_CHOICES = [
        (ASSIGN, "Assign to sales"),
        (RETURN, "Return from sales"),
    ]

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="stock_movements",
    )
    salesperson = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="stock_movements",
        limit_choices_to={"role": "SALES"},
    )
    movement_type = models.CharField(max_length=10, choices=MOVEMENT_TYPE_CHOICES)
    quantity = models.PositiveIntegerField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_stock_movements",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.movement_type} {self.quantity} {self.product}"


class SalesDeposit(models.Model):
    BANK_CBE = "CBE"
    BANK_ABYSSINIA = "ABYSSINIA"
    BANK_DASHEN = "DASHEN"
    BANK_AWASH = "AWASH"
    BANK_WEGAHEN = "WEGAHEN"
    BANK_NIB = "NIB"
    BANK_COOP = "COOP"
    BANK_ZEMEN = "ZEMEN"

    BANK_CHOICES = [
        (BANK_CBE, "CBE"),
        (BANK_ABYSSINIA, "Abyssinia"),
        (BANK_DASHEN, "Dashen"),
        (BANK_AWASH, "Awash"),
        (BANK_WEGAHEN, "Wegagen"),
        (BANK_NIB, "Nib"),
        (BANK_COOP, "Cooperative Bank"),
        (BANK_ZEMEN, "Zemen"),
    ]

    salesperson = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sales_deposits",
        limit_choices_to={"role": "SALES"},
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="sales_deposits",
    )
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    bank_name = models.CharField(max_length=32, choices=BANK_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.salesperson} sold {self.quantity} {self.product} via {self.bank_name}"
