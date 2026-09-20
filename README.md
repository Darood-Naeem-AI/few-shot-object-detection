# Few-Shot Object Detection Web App 🎯

A full-stack web application for detecting custom objects in images using OWL-ViT, with true few-shot (image-guided) detection support.

## ✨ Features

- 🖼️ Image Upload - Support for JPEG, PNG, WebP
- 🎯 Custom Object Detection - Detect any object by name
- 📸 Few-Shot Learning - Provide 1, 5, or 10 support images to guide detection using visual examples, not just text
- 🟩 Bounding Box Visualization - Detected objects are drawn directly on the query image with confidence labels
- 📊 Confidence Scoring - Each detection shows confidence
- 🎨 Beautiful UI - Modern React interface with live image previews
- ⚡ Real-time Inference - Fast detection on CPU

## 🛠️ Tech Stack

### Backend
- FastAPI - Python web framework
- PyTorch - Deep learning
- OWL-ViT - Object detection model (text-prompt + image-guided detection)
- OpenCV - Image processing
- Uvicorn - Web server

### Frontend
- React 18 - UI library
- Vite - Build tool
- Axios - HTTP client
- HTML5 Canvas - Bounding box rendering
- CSS3 - Styling

## 📁 Project Structure
few-shot-object-detection/
├── backend/
│ ├── app/
│ │ ├── main.py
│ │ └── services/
│ │ └── detection_service.py
│ └── uploads/
├── frontend/
│ ├── src/
│ │ ├── App.jsx
│ │ └── components/
│ │ ├── Home.jsx
│ │ └── ImageUploader.jsx
│ └── package.json
├── requirements.txt
└── README.md

## 🚀 Installation

### Backend Setup

```bash
cd ~/Desktop/few-shot-object-detection
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8001
```

**Backend running on:** http://localhost:8001

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend running on:** http://localhost:5173

## 📖 How to Use

1. Open http://localhost:5173
2. Click "Start Detection"
3. Select a shot type (1-shot, 5-shot, or 10-shot)
4. Upload the required number of support images (reference images of the object)
5. Upload a query image (the image to search in)
6. Enter object name (e.g., "cat", "person")
7. Click "Detect Objects"
8. View results with bounding boxes and confidence scores drawn directly on the image

## 📡 API Endpoints

### Upload Image

POST /upload

file: Image file


### Detect Objects

POST /detect
Content-Type: application/json

{
"query_image": "image.jpg",
"object_name": "cat",
"support_images": ["support1.jpg", "support2.jpg"],
"confidence_threshold": 0.05
}


Returns: detections with bounding boxes, confidence scores, and detection `mode` (`few-shot` if support images were provided, `zero-shot` otherwise)

## 🆕 Recent Updates

### Bug Fix: Few-Shot Detection Now Fully Functional
Previously, the `/detect` endpoint did not forward support images to the detection service, so the app always fell back to zero-shot text-based detection regardless of the selected shot type. This has been fixed:

- `/detect` now accepts a JSON body including `support_images` (a list of uploaded filenames)
- The detection service uses OWL-ViT's `image_guided_detection` method to perform genuine few-shot detection when support images are provided
- Falls back to zero-shot text-prompt detection automatically when no support images are given

### New Feature: Bounding Box Visualization
- Detection results are rendered directly on the query image using an HTML5 Canvas
- Each detected object shows a green bounding box with its label and confidence score
- Support and query images now display live thumbnail previews immediately after upload

## 🐛 Troubleshooting

### Port already in use?
```bash
lsof -i :8001
kill -9 [PID]
```

### Model takes time to download?
- First run downloads 613MB model
- Cached for future runs
- Takes 2-3 minutes first time

### No detections found?
- Try different object names
- Lower confidence threshold
- Use clear, good quality images
- For few-shot mode, make sure the number of uploaded support images matches the selected shot type

### Frontend can't reach backend / uploads failing?
- Check that the frontend's `API_BASE` in `ImageUploader.jsx` matches the port the backend is actually running on

## 👨‍💻 Author

**Darood Naeem**
- AI/ML Developer
- GitHub: @Darood-Naeem-AI
- Location: Faisalabad, Pakistan

## 📄 License

MIT License - Open Source

## 🙏 Credits

- OWL-ViT Model - Google Research
- Hugging Face - Transformers
- FastAPI - Web Framework
- React - UI Library

---

Happy Detecting! 🎉

Made with ❤️ by Darood Naeem