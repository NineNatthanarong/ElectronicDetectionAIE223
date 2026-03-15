import os
import io
import base64
import cv2
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Load YOLO model
model = None
model_path = os.path.join(os.path.dirname(__file__), 'best.pt')

def load_model():
    global model
    try:
        logger.info(f"Loading model from {model_path}")
        model = YOLO(model_path)
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise e

# Load model on startup
load_model()

def predict_image(image_data, conf_threshold=0.25):
    """Run prediction on image and return results"""
    try:
        results = model(image_data, conf=conf_threshold)
        result = results[0]
        
        detections = []
        if result.boxes is not None:
            boxes = result.boxes.xyxy.tolist()
            classes = result.boxes.cls.tolist()
            confidences = result.boxes.conf.tolist()
            
            for box, cls, conf in zip(boxes, classes, confidences):
                detections.append({
                    'bbox': [float(x) for x in box],
                    'class': result.names[int(cls)],
                    'confidence': float(conf)
                })
        
        return detections
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise e

def draw_boxes(image, detections):
    """Draw bounding boxes on image"""
    img = image.copy()
    colors = [
        (255, 99, 71),   # Tomato
        (50, 205, 50),   # Lime Green
        (30, 144, 255),  # Dodger Blue
        (255, 215, 0),   # Gold
        (238, 130, 238), # Violet
        (0, 255, 255),   # Cyan
    ]
    
    for i, det in enumerate(detections):
        x1, y1, x2, y2 = map(int, det['bbox'])
        label = det['class']
        conf = det['confidence']
        color = colors[i % len(colors)]
        
        # Draw box
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
        
        # Draw label background
        text = f"{label} {conf:.2f}"
        (text_w, text_h), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(img, (x1, y1 - text_h - 10), (x1 + text_w, y1), color, -1)
        
        # Draw label text
        cv2.putText(img, text, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
    return img

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        conf_threshold = float(request.form.get('confidence', 0.25))
        
        # Read image
        image_bytes = file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({'error': 'Invalid image'}), 400
        
        # Run prediction
        detections = predict_image(image, conf_threshold)
        
        # Draw boxes on image
        annotated_image = draw_boxes(image, detections)
        
        # Convert to base64
        _, buffer = cv2.imencode('.jpg', annotated_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'success': True,
            'detections': detections,
            'annotated_image': f'data:image/jpeg;base64,{img_base64}',
            'count': len(detections)
        })
        
    except Exception as e:
        logger.error(f"Error in predict endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict/base64', methods=['POST'])
def predict_base64():
    try:
        data = request.get_json(force=True)
        if not data or 'image' not in data:
            logger.error("No image in request data")
            return jsonify({'error': 'No image provided'}), 400
        
        image_data = data['image']
        conf_threshold = float(data.get('confidence', 0.25))
        
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Add padding if needed for base64 decoding
        missing_padding = len(image_data) % 4
        if missing_padding:
            image_data += '=' * (4 - missing_padding)
        
        # Decode base64
        try:
            image_bytes = base64.b64decode(image_data)
        except Exception as decode_error:
            logger.error(f"Base64 decode error: {decode_error}")
            return jsonify({'error': 'Invalid base64 data'}), 400
        
        if len(image_bytes) == 0:
            logger.error("Decoded image bytes is empty")
            return jsonify({'error': 'Empty image data'}), 400
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            logger.error("cv2.imdecode returned None - invalid image format")
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Run prediction
        detections = predict_image(image, conf_threshold)
        
        # Draw boxes on image
        annotated_image = draw_boxes(image, detections)
        
        # Convert to base64
        _, buffer = cv2.imencode('.jpg', annotated_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'success': True,
            'detections': detections,
            'annotated_image': f'data:image/jpeg;base64,{img_base64}',
            'count': len(detections)
        })
        
    except Exception as e:
        logger.error(f"Error in predict_base64 endpoint: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Return list of class names from the model"""
    try:
        classes = list(model.names.values()) if model else []
        return jsonify({'classes': classes})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
