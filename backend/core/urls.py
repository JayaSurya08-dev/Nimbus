from django.urls import path
from .views import FileUploadView, FileListView, FileDownloadView, FileDeleteView

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='upload_file'),
    path('files/', FileListView.as_view(), name='list_files'),
    path('download/<int:file_id>/', FileDownloadView.as_view(), name='download_file'),
    path('delete/<int:file_id>/', FileDeleteView.as_view(), name='delete_file'),
]
