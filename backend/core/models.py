from django.db import models
from django.contrib.auth.models import User

class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    size = models.BigIntegerField()
    supabase_path = models.TextField(null=True, blank=True)   # path used for download/delete
    url = models.TextField(null=True, blank=True)             # public URL
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
