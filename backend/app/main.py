from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json

from backend.app.services.detection_service import get_detection_service

app = FastAPI(
    title="Few-Shot Object Detection API",
    description="FSOD backend with OWL-ViT model"
)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/")
def read_root():
    return {
        "message": "Few-Shot Object Detection API",
        "status": "running"
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file"""
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
        return {
            "error": str(e),
            "message": "Upload failed"
        }

@app.post("/detect")
async def detect(query_image: str, object_name: str, confidence_threshold: float = 0.1):
    """
    Detect objects in query image
    
    Args:
        query_image: Filename of the query image
        object_name: Name of the object to detect
        confidence_threshold: Minimum confidence score
    """
    try:
        query_path = UPLOAD_DIR / query_image
        
        if not query_path.exists():
            return {"error": f"Image {query_image} not found"}
        
        service = get_detection_service()
        result = service.detect(str(query_path), [], object_name, confidence_threshold)
        
        return result
    
    except Exception as e:
        return {
            "error": str(e),
            "detections": []
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
