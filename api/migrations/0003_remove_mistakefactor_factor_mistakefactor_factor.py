# Generated by Django 5.0.4 on 2024-05-03 10:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_mistake_counter'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mistakefactor',
            name='factor',
        ),
        migrations.AddField(
            model_name='mistakefactor',
            name='factor',
            field=models.ManyToManyField(blank=True, to='api.factor'),
        ),
    ]
