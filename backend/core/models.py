from django.db import models
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.http import FileResponse, Http404

# Create your models here.
class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name=models.CharField(max_length=255)
    file=models.FileField(upload_to='uploads/')
    size=models.BigIntegerField()
    uploaded_at=models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name

class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES['file']
        file_instance = File.objects.create(
            user=request.user,
            name=uploaded_file.name,
            file=uploaded_file,
            size=uploaded_file.size
        )
        return Response({
    "id": file_instance.id,
    "name": file_instance.name,
    "size": file_instance.size,
    "uploaded_at": file_instance.uploaded_at,
    "download_url": request.build_absolute_uri(f"/api/download/{file_instance.id}/")
}, status=201)
    
class FileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        files = File.objects.filter(user=request.user)
        data = [
            {
                "id": f.id,
                "name": f.name,
                "size": f.size,
                "uploaded_at": f.uploaded_at,
                "download_url": request.build_absolute_uri(f"/api/download/{f.id}/")
            }
            for f in files
        ]
        return Response(data)



class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        try:
            file = File.objects.get(id=file_id, user=request.user)
            return FileResponse(file.file, as_attachment=True, filename=file.name)
        except File.DoesNotExist:
            raise Http404("File not found or not authorized.")
