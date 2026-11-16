from django.contrib import messages
from django.shortcuts import redirect, render
from django.urls import reverse

from .forms import CustomerForm


def register_customer(request):
    if request.method == "POST":
        form = CustomerForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Your order details have been received. We will contact you shortly.")
            return redirect(f"{reverse('customer:register')}?ordered=1")
    else:
        form = CustomerForm()

    return render(request, "customer/register.html", {"form": form})
