from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.http import FileResponse, Http404
from .models import File

# Upload a file
class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({"error": "No file provided."}, status=400)

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


# List all files
class FileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        files = File.objects.filter(user=request.user).order_by('-uploaded_at')
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


# Download a file
class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        try:
            file_obj = File.objects.get(id=file_id, user=request.user)
            return FileResponse(file_obj.file, as_attachment=True, filename=file_obj.name)
        except File.DoesNotExist:
            raise Http404("File not found or not authorized.")


# Delete a file
class FileDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, file_id):
        try:
            file_obj = File.objects.get(id=file_id, user=request.user)
            file_obj.file.delete()
            file_obj.delete()
            return Response({"message": "File deleted successfully"}, status=204)
        except File.DoesNotExist:
            return Response({"error": "File not found"}, status=404)
