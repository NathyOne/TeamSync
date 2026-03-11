from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("user", "0005_alter_user_created_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="badge",
            field=models.CharField(
                choices=[
                    ("BASIC", "Basic"),
                    ("SILVER", "Silver"),
                    ("GOLD", "Gold"),
                    ("DIAMOND", "Diamond"),
                ],
                default="BASIC",
                max_length=20,
            ),
        ),
    ]
