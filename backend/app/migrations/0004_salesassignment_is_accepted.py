from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0003_salesassignment_stockmovement"),
    ]

    operations = [
        migrations.AddField(
            model_name="salesassignment",
            name="is_accepted",
            field=models.BooleanField(default=False),
        ),
    ]
