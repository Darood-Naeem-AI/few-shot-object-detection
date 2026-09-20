import torch
from transformers import OwlViTProcessor, OwlViTForObjectDetection
from PIL import Image
import numpy as np
from pathlib import Path

class DetectionService:
    def __init__(self):
        print("Loading OWL-ViT model...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")

        self.processor = OwlViTProcessor.from_pretrained("google/owlvit-base-patch32")
        self.model = OwlViTForObjectDetection.from_pretrained("google/owlvit-base-patch32")
        self.model.to(self.device)
        self.model.eval()

        print("Model loaded successfully!")

    def load_image(self, image_path):
        image = Image.open(image_path).convert("RGB")
        return image

    def detect(self, query_image_path, support_images_paths, object_name, confidence_threshold=0.1):
        """
        Detect objects in query image.
        If support_images_paths is provided -> few-shot (image-guided) detection.
        If empty -> falls back to zero-shot text-based detection.
        """
        try:
            query_image = self.load_image(query_image_path)
            query_image_np = np.array(query_image)

            if support_images_paths:
                # ✅ FEW-SHOT: image-guided detection using support images
                detections = self._detect_with_support_images(
                    query_image, support_images_paths, object_name, confidence_threshold
                )
            else:
                # Zero-shot fallback (text-prompt based)
                detections = self._detect_zero_shot(
                    query_image, object_name, confidence_threshold
                )

            return {
                "image_shape": query_image_np.shape,
                "detections": detections,
                "num_detections": len(detections),
                "mode": "few-shot" if support_images_paths else "zero-shot"
            }

        except Exception as e:
            return {"error": str(e), "detections": []}

    def _detect_zero_shot(self, query_image, object_name, confidence_threshold):
        """Original text-prompt based detection"""
        texts = [[object_name]]
        inputs = self.processor(text=texts, images=query_image, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs)

        target_sizes = torch.Tensor([query_image.size[::-1]])
        results = self.processor.post_process_object_detection(
            outputs, target_sizes=target_sizes, threshold=confidence_threshold
        )

        detections = []
        boxes, scores = results[0]["boxes"], results[0]["scores"]
        for box, score in zip(boxes, scores):
            if score >= confidence_threshold:
                detections.append({
                    "label": object_name,
                    "confidence": float(score),
                    "box": [float(x) for x in box.tolist()]
                })
        return detections

    def _detect_with_support_images(self, query_image, support_images_paths, object_name, confidence_threshold):
        """
        Few-shot detection: use each support image as a visual query
        via OWL-ViT's image_guided_detection, then merge results.
        """
        all_detections = []
        target_sizes = torch.Tensor([query_image.size[::-1]])

        for support_path in support_images_paths:
            support_image = self.load_image(support_path)

            inputs = self.processor(
                query_images=support_image,
                images=query_image,
                return_tensors="pt"
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = self.model.image_guided_detection(**inputs)

            results = self.processor.post_process_image_guided_detection(
                outputs=outputs,
                threshold=confidence_threshold,
                nms_threshold=0.3,
                target_sizes=target_sizes
            )

            boxes = results[0]["boxes"]
            scores = results[0]["scores"]

            for box, score in zip(boxes, scores):
                if score >= confidence_threshold:
                    all_detections.append({
                        "label": object_name,
                        "confidence": float(score),
                        "box": [float(x) for x in box.tolist()],
                        "support_image": Path(support_path).name
                    })

        # Merge overlapping boxes across support images (simple NMS by keeping highest confidence per region)
        merged = self._merge_detections(all_detections)
        return merged

    def _merge_detections(self, detections, iou_threshold=0.5):
        """Simple NMS-style merge: if boxes overlap heavily, keep the highest confidence one"""
        if not detections:
            return []

        detections = sorted(detections, key=lambda d: d["confidence"], reverse=True)
        kept = []

        def iou(box1, box2):
            x1 = max(box1[0], box2[0])
            y1 = max(box1[1], box2[1])
            x2 = min(box1[2], box2[2])
            y2 = min(box1[3], box2[3])
            inter = max(0, x2 - x1) * max(0, y2 - y1)
            area1 = (box1[2]-box1[0]) * (box1[3]-box1[1])
            area2 = (box2[2]-box2[0]) * (box2[3]-box2[1])
            union = area1 + area2 - inter
            return inter / union if union > 0 else 0

        for det in detections:
            duplicate = False
            for k in kept:
                if iou(det["box"], k["box"]) > iou_threshold:
                    duplicate = True
                    break
            if not duplicate:
                kept.append(det)

        return kept


detection_service = None

def get_detection_service():
    global detection_service
    if detection_service is None:
        detection_service = DetectionService()
    return detection_service