from django.shortcuts import render

from product.models import Product

# Create your views here.
def index(request):
    products = Product.objects.filter(is_available=True)
    return render(request, 'index.html', {'products': products})


def about(request):
    return render(request, 'about.html')


def menu(request):
    return render(request, 'menu.html')


def contact(request):
    return render(request, 'contact.html')
