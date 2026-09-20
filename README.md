# Few-Shot Object Detection Web App 🎯

A full-stack web application for detecting custom objects in images using OWL-ViT.

## ✨ Features

- 🖼️ Image Upload - Support for JPEG, PNG, WebP
- 🎯 Custom Object Detection - Detect any object by name
- 📊 Confidence Scoring - Each detection shows confidence
- 🎨 Beautiful UI - Modern React interface
- ⚡ Real-time Inference - Fast detection on CPU

## 🛠️ Tech Stack

### Backend
- FastAPI - Python web framework
- PyTorch - Deep learning
- OWL-ViT - Object detection model
- OpenCV - Image processing
- Uvicorn - Web server

### Frontend
- React 18 - UI library
- Vite - Build tool
- Axios - HTTP client
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
3. Upload an image
4. Enter object name (e.g., "cat", "person")
5. Click "Detect Objects"
6. View results with confidence scores

## 📡 API Endpoints

### Upload Image
POST /upload

file: Image file

### Detect Objects
POST /detect?query_image=image.jpg&object_name=cat

Returns: detections with confidence scores

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
