from django.urls import path
from . import views

urlpatterns=[
    path('upload/',views.upload_file),
    path('files/',views.get_files),
    path('download/<int:pk>/', views.download_file, name='download_file'),
    path('api/delete/<int:pk>/', views.delete_file,name='delete_file'),
]