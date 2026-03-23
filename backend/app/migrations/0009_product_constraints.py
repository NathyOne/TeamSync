from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0008_auditlog"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="product",
            constraint=models.CheckConstraint(
                condition=Q(("quantity__gte", 0)),
                name="product_quantity_nonnegative",
            ),
        ),
        migrations.AddConstraint(
            model_name="product",
            constraint=models.CheckConstraint(
                condition=Q(("price__gte", 0)),
                name="product_price_nonnegative",
            ),
        ),
        migrations.AddConstraint(
            model_name="product",
            constraint=models.CheckConstraint(
                condition=Q(("reorder_threshold__gte", 0)),
                name="product_reorder_threshold_nonnegative",
            ),
        ),
    ]
