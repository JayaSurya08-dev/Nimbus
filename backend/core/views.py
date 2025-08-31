from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view,authentication_classes,permission_classes
from .serializers import FileSerializer
from rest_framework import status
from .models import File
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse, Http404,HttpResponse
from rest_framework.permissions import AllowAny


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def upload_file(request): 
    data=request.data.copy()
    data['user']=request.user.id

    serializer =FileSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_files(request):
    files=File.objects.filter(user=request.user).order_by('-uploaded_at')
    serializer=FileSerializer(files,many=True)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def download_file(request, pk):
    try:
        file_obj = File.objects.get(pk=pk, user=request.user)
        response = FileResponse(file_obj.file.open(), as_attachment=True, filename=file_obj.name)
        return response
    except File.DoesNotExist:
        raise Http404("File not found.")

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_file(request, pk):
    try:
        file_obj = File.objects.get(pk=pk, user=request.user)
        file_obj.file.delete()  # Delete file from storage
        file_obj.delete()       # Delete DB record
        return Response({"message": "File deleted successfully"}, status=204)
    except File.DoesNotExist:
        return Response({"error": "File not found"}, status=404)
