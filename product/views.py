from django.shortcuts import render

from .models import Product


def product_list(request):
    products = Product.objects.filter(is_available=True)
    return render(request, "menu.html", {"products": products})
