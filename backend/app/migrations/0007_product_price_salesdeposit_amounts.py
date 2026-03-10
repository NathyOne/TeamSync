from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0006_product_reorder_threshold"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="price",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name="salesdeposit",
            name="unit_price",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name="salesdeposit",
            name="total_amount",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
    ]
