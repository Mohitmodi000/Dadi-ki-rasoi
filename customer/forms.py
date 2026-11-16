from django import forms

from .models import Customer


class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ["name", "phone", "address"]
        widgets = {
            "name": forms.TextInput(attrs={"class": "form-control", "placeholder": "Full name"}),
            "phone": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "10-digit phone number",
                    "type": "tel",
                    "inputmode": "numeric",
                    "pattern": "[0-9]{10}",
                }
            ),
            "address": forms.Textarea(
                attrs={"class": "form-control", "rows": 4, "placeholder": "Delivery address"}
            ),
        }

    def clean_phone(self):
        phone = self.cleaned_data["phone"].strip().replace(" ", "")
        if not phone.isdigit() or len(phone) != 10:
            raise forms.ValidationError("Enter a valid 10-digit phone number.")
        return phone
