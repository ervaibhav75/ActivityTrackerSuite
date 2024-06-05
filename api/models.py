from django.db import models
from django.contrib.auth.models import User

from django.db import models

class Mistake(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    counter = models.IntegerField(default=0)

    def __str__(self):
        return self.title
    
# contact/models.py
class ContactMessage(models.Model):
    title = models.CharField(max_length=200, blank=False, null=False)
    description = models.TextField(blank=False, null=False)
    contact_number = models.CharField(max_length=15,  blank=True, null=True)
    email = models.EmailField() 
    

    def __str__(self):
        return self.title


class Factor(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    solution = models.TextField()
    counter = models.IntegerField(default=0)

    def __str__(self):
        return self.title

class MistakeFactor(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mistake = models.ForeignKey(Mistake, on_delete=models.CASCADE)
    factor = models.ManyToManyField(Factor, blank=True)
    date = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return "Mistake By"+ " - "+ str(self.user)+ " - "  + self.mistake.title 

