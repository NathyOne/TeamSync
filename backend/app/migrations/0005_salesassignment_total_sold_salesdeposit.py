from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0004_salesassignment_is_accepted"),
    ]

    operations = [
        migrations.AddField(
            model_name="salesassignment",
            name="total_sold",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.CreateModel(
            name="SalesDeposit",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("quantity", models.PositiveIntegerField()),
                ("bank_name", models.CharField(choices=[("CBE", "CBE"), ("ABYSSINIA", "Abyssinia"), ("DASHEN", "Dashen"), ("AWASH", "Awash"), ("WEGAHEN", "Wegagen"), ("NIB", "Nib"), ("COOP", "Cooperative Bank"), ("ZEMEN", "Zemen")], max_length=32)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("product", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sales_deposits", to="app.product")),
                ("salesperson", models.ForeignKey(limit_choices_to={"role": "SALES"}, on_delete=django.db.models.deletion.CASCADE, related_name="sales_deposits", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
