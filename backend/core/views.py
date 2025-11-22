from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.http import Http404
from .models import File
from .supabase_upload import upload_file_to_supabase, get_public_url, get_signed_url, delete_file_supabase
import uuid

# Upload a file
class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response({"error": "No file provided."}, status=400)

        # Unique filename (avoid overwriting)
        filename = f"{request.user.id}/{uuid.uuid4()}_{uploaded_file.name}"

        # Upload to Supabase
        upload_file_to_supabase(uploaded_file, filename)

        # For public buckets
        public_url = get_public_url(filename)

        # Store in DB
        file_instance = File.objects.create(
            user=request.user,
            name=uploaded_file.name,
            size=uploaded_file.size,
            supabase_path=filename,
            url=public_url
        )

        return Response({
            "id": file_instance.id,
            "name": file_instance.name,
            "size": file_instance.size,
            "uploaded_at": file_instance.uploaded_at,
            "url": file_instance.url,     # public URL
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
                "url": f.url,   # public URL
            }
            for f in files
        ]
        return Response(data)


# Download via signed URL
class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        try:
            file_obj = File.objects.get(id=file_id, user=request.user)
        except File.DoesNotExist:
            raise Http404("File not found or unauthorized.")

        # Create a signed URL (valid for 1 hour)
        download_url = get_signed_url(file_obj.supabase_path)

        return Response({"download_url": download_url})


# Delete file
class FileDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, file_id):
        try:
            file_obj = File.objects.get(id=file_id, user=request.user)
        except File.DoesNotExist:
            return Response({"error": "File not found"}, status=404)

        # Delete from Supabase
        delete_file_supabase(file_obj.supabase_path)

        # Delete from DB
        file_obj.delete()

        return Response({"message": "File deleted successfully"}, status=204)
