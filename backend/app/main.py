from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import List

from backend.app.services.detection_service import get_detection_service

app = FastAPI(
    title="Few-Shot Object Detection API",
    description="FSOD backend with OWL-ViT model"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# ✅ Request body model
class DetectRequest(BaseModel):
    query_image: str
    object_name: str
    support_images: List[str] = []
    confidence_threshold: float = 0.1

@app.get("/")
def read_root():
    return {"message": "Few-Shot Object Detection API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            contents = await file.read()
            buffer.write(contents)
        return {
            "filename": file.filename,
            "filepath": str(file_path),
            "size": len(contents),
            "message": "File uploaded successfully"
        }
    except Exception as e:
        return {"error": str(e), "message": "Upload failed"}

@app.post("/detect")
async def detect(request: DetectRequest):
    """
    Detect objects in query image using few-shot support images
    """
    try:
        query_path = UPLOAD_DIR / request.query_image

        if not query_path.exists():
            return {"error": f"Image {request.query_image} not found"}

        support_paths = []
        for img_name in request.support_images:
            img_path = UPLOAD_DIR / img_name
            if not img_path.exists():
                return {"error": f"Support image {img_name} not found"}
            support_paths.append(str(img_path))

        service = get_detection_service()
        result = service.detect(
            str(query_path),
            support_paths,
            request.object_name,
            request.confidence_threshold
        )

        return result

    except Exception as e:
        return {"error": str(e), "detections": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)