import torch
from transformers import OwlViTProcessor, OwlViTForObjectDetection
from PIL import Image
import numpy as np
from pathlib import Path

class DetectionService:
    def __init__(self):
        """Initialize OWL-ViT model and processor"""
        print("Loading OWL-ViT model...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        
        # Load processor and model from Hugging Face
        self.processor = OwlViTProcessor.from_pretrained("google/owlvit-base-patch32")
        self.model = OwlViTForObjectDetection.from_pretrained("google/owlvit-base-patch32")
        self.model.to(self.device)
        self.model.eval()
        
        print("Model loaded successfully!")
    
    def load_image(self, image_path):
        """Load image from file path"""
        image = Image.open(image_path).convert("RGB")
        return image
    
    def detect(self, query_image_path, support_images_paths, object_name, confidence_threshold=0.1):
        """
        Detect objects in query image
        
        Args:
            query_image_path: Path to the image to detect objects in
            support_images_paths: List of paths to support/example images
            object_name: Name of the object class to detect
            confidence_threshold: Minimum confidence score
        
        Returns:
            Dictionary with detections
        """
        try:
            # Load query image
            query_image = self.load_image(query_image_path)
            query_image_np = np.array(query_image)
            
            # Prepare texts for detection
            texts = [[object_name]]
            
            # Process query image with the model
            inputs = self.processor(text=texts, images=query_image, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Run inference
            with torch.no_grad():
                outputs = self.model(**inputs)
            
            # Post-process results
            target_sizes = torch.Tensor([query_image.size[::-1]])
            results = self.processor.post_process_object_detection(
                outputs, 
                target_sizes=target_sizes, 
                threshold=confidence_threshold
            )
            
            # Extract detections
            detections = []
            boxes, scores, labels = results[0]["boxes"], results[0]["scores"], results[0]["labels"]
            
            for box, score in zip(boxes, scores):
                if score >= confidence_threshold:
                    detection = {
                        "label": object_name,
                        "confidence": float(score),
                        "box": [float(x) for x in box.tolist()]
                    }
                    detections.append(detection)
            
            return {
                "image_shape": query_image_np.shape,
                "detections": detections,
                "num_detections": len(detections)
            }
        
        except Exception as e:
            return {
                "error": str(e),
                "detections": []
            }

# Create a global instance
detection_service = None

def get_detection_service():
    """Get or create the global detection service instance"""
    global detection_service
    if detection_service is None:
        detection_service = DetectionService()
    return detection_service
