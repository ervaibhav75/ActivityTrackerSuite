from django.contrib import admin
from .models import Mistake, Factor, MistakeFactor, ContactMessage
# Register your models here.
admin.site.register(MistakeFactor)
admin.site.register(ContactMessage) 
admin.site.register(Mistake)
admin.site.register(Factor)