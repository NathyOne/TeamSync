from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0005_salesassignment_total_sold_salesdeposit"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="reorder_threshold",
            field=models.PositiveIntegerField(default=10),
        ),
    ]
