from django.db import models


class Product(models.Model):
    class Category(models.TextChoices):
        THALI = "thali", "Thali"
        SABZI = "sabzi", "Sabzi & Dal"
        ROTI = "roti", "Roti & Rice"
        SNACK = "snack", "Snacks"
        SWEET = "sweet", "Meetha"

    name = models.CharField(max_length=120)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.THALI)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to="products/", blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "name"]

    def __str__(self):
        return self.name
