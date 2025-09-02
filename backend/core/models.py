from django.db import models
from django.contrib.auth.models import User

class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')
    size = models.BigIntegerField()
    uploaded_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name
