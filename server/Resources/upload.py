import os
import time
from flask import request, jsonify, send_from_directory
from flask_restful import Resource
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class UploadImage(Resource):
    def post(self):
        if 'image' not in request.files:
            return {'error': 'No file part'}, 400
        file = request.files['image']
        if file.filename == '':
            return {'error': 'No selected file'}, 400
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filename = f"{int(time.time())}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            image_url = f"http://localhost:5555/uploads/{filename}"
            return {'image_url': image_url}, 200
        return {'error': 'Invalid file type'}, 400

class ServeUploadedFile(Resource):
    def get(self, filename):
        return send_from_directory(UPLOAD_FOLDER, filename)
