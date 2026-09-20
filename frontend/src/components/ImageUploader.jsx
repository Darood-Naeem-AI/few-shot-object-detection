import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function ImageUploader({ onNavigate, uploadedImages, setUploadedImages }) {
  const [objectName, setObjectName] = useState('')
  const [shotType, setShotType] = useState('1-shot')
  const [detectionResult, setDetectionResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [supportPreviews, setSupportPreviews] = useState([])
  const [queryPreview, setQueryPreview] = useState(null)

  // ✅ NAYA: canvas reference
  const canvasRef = useRef(null)

  const handleSupportImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    setLoading(true)
    try {
      for (const file of files) {
        const previewUrl = URL.createObjectURL(file)
        setSupportPreviews(prev => [...prev, previewUrl])

        const formData = new FormData()
        formData.append('file', file)
        const response = await axios.post(`${API_BASE}/upload`, formData)
        setUploadedImages(prev => ({
          ...prev,
          support: [...prev.support, response.data.filename]
        }))
      }
    } catch (error) {
      alert('Error uploading support images: ' + error.message)
    }
    setLoading(false)
  }

  const handleQueryImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setQueryPreview(URL.createObjectURL(file))
    setDetectionResult(null) // ✅ purana result clear karo naye query image ke liye

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await axios.post(`${API_BASE}/upload`, formData)
      setUploadedImages(prev => ({ ...prev, query: response.data.filename }))
    } catch (error) {
      alert('Error uploading query image: ' + error.message)
    }
    setLoading(false)
  }

  const handleDetect = async () => {
    if (!uploadedImages.query || !objectName) {
      alert('Please upload query image and enter object name')
      return
    }

    const requiredShots = { '1-shot': 1, '5-shot': 5, '10-shot': 10 }[shotType]
    if (uploadedImages.support.length < requiredShots) {
      alert(`${shotType} ke liye kam se kam ${requiredShots} support image(s) upload karo (abhi ${uploadedImages.support.length} hain)`)
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE}/detect`, {
        query_image: uploadedImages.query,
        object_name: objectName,
        support_images: uploadedImages.support,
        confidence_threshold: 0.05
      })
      setDetectionResult(response.data)
    } catch (error) {
      alert('Error during detection: ' + error.message)
    }
    setLoading(false)
  }

  // ✅ NAYA: jab bhi detectionResult ya queryPreview badle, canvas dobara draw karo
  useEffect(() => {
    if (!detectionResult || !queryPreview) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Canvas ko image ke actual size ka banao
      canvas.width = img.width
      canvas.height = img.height

      // Image draw karo
      ctx.drawImage(img, 0, 0)

      // Har detection ke liye box draw karo
      detectionResult.detections?.forEach((det) => {
        const [x1, y1, x2, y2] = det.box
        const boxWidth = x2 - x1
        const boxHeight = y2 - y1

        // Rectangle draw karo
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 3
        ctx.strokeRect(x1, y1, boxWidth, boxHeight)

        // Label background
        const label = `${det.label} ${(det.confidence * 100).toFixed(1)}%`
        ctx.font = 'bold 16px Arial'
        const textWidth = ctx.measureText(label).width

        ctx.fillStyle = '#00ff00'
        ctx.fillRect(x1, y1 > 20 ? y1 - 22 : y1, textWidth + 10, 22)

        // Label text
        ctx.fillStyle = '#000000'
        ctx.fillText(label, x1 + 5, y1 > 20 ? y1 - 5 : y1 + 16)
      })
    }

    img.src = queryPreview
  }, [detectionResult, queryPreview])

  return (
    <div className="uploader-container">
      <button className="btn-back" onClick={() => onNavigate('home')}>← Back</button>
      <h1>Few-Shot Object Detection</h1>

      <div className="control-panel">
        <div className="form-group">
          <label>Object Name:</label>
          <input
            type="text"
            value={objectName}
            onChange={(e) => setObjectName(e.target.value)}
            placeholder="e.g., person, car, dog"
          />
        </div>

        <div className="form-group">
          <label>Shot Type:</label>
          <select value={shotType} onChange={(e) => setShotType(e.target.value)}>
            <option>1-shot</option>
            <option>5-shot</option>
            <option>10-shot</option>
          </select>
        </div>

        <div className="form-group">
          <label>Support Images ({uploadedImages.support.length} uploaded):</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleSupportImageUpload}
            disabled={loading}
          />
          {supportPreviews.length > 0 && (
            <div className="preview-grid">
              {supportPreviews.map((url, idx) => (
                <img key={idx} src={url} alt={`support-${idx}`} className="preview-thumb" />
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Query Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleQueryImageUpload}
            disabled={loading}
          />
          {uploadedImages.query && <p className="success">✓ {uploadedImages.query}</p>}
          {/* ✅ Detection result aane se pehle sirf plain preview dikhao */}
          {queryPreview && !detectionResult && (
            <img src={queryPreview} alt="query" className="preview-thumb-large" />
          )}
        </div>

        <button className="btn btn-primary" onClick={handleDetect} disabled={loading}>
          {loading ? 'Processing...' : 'Detect Objects'}
        </button>
      </div>

      {detectionResult && (
        <div className="result-section">
          <h2>Detection Results</h2>
          <p>Found {detectionResult.num_detections} object(s)</p>
          {detectionResult.mode && <p className="mode-badge">Mode: {detectionResult.mode}</p>}

          {/* ✅ NAYA: Canvas jisme image + bounding boxes dikhengi */}
          <canvas ref={canvasRef} className="detection-canvas" />

          {detectionResult.detections?.length > 0 ? (
            <div className="detections-list">
              {detectionResult.detections.map((det, idx) => (
                <div key={idx} className="detection-item">
                  <p><strong>{det.label}</strong> - Confidence: {(det.confidence * 100).toFixed(2)}%</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-detections">No objects detected</p>
          )}
        </div>
      )}
    </div>
  )
}