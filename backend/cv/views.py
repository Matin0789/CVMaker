from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os
import uuid
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

def cv_view(request):
    """Serve the CV frontend"""
    return render(request, 'cv/index.html')

@csrf_exempt
def upload_photo(request):
    """Handle photo uploads"""
    if request.method == 'POST' and request.FILES.get('photo'):
        photo_file = request.FILES['photo']
        
        # Generate unique filename
        file_extension = os.path.splitext(photo_file.name)[1]
        filename = f"photos/{uuid.uuid4()}{file_extension}"
        
        # Save file to media directory
        path = default_storage.save(filename, ContentFile(photo_file.read()))
        
        # Return the URL to the uploaded file
        photo_url = f"/media/{path}"
        
        return JsonResponse({
            'success': True,
            'photo_url': photo_url
        })
    
    return JsonResponse({
        'success': False,
        'error': 'No photo file provided'
    }, status=400)
