import { useState } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8001'

export default function ImageUploader({ onNavigate, uploadedImages, setUploadedImages }) {
  const [objectName, setObjectName] = useState('')
  const [shotType, setShotType] = useState('1-shot')
  const [detectionResult, setDetectionResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSupportImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    setLoading(true)

    try {
      for (const file of files) {
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

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await axios.post(`${API_BASE}/upload`, formData)
      setUploadedImages(prev => ({
        ...prev,
        query: response.data.filename
      }))
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

    setLoading(true)
    try {
      const response = await axios.post(
        `${API_BASE}/detect`,
        {},
        {
          params: {
            query_image: uploadedImages.query,
            object_name: objectName,
            confidence_threshold: 0.05
          }
        }
      )
      setDetectionResult(response.data)
    } catch (error) {
      alert('Error during detection: ' + error.message)
    }
    setLoading(false)
  }

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
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleDetect}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Detect Objects'}
        </button>
      </div>

      {detectionResult && (
        <div className="result-section">
          <h2>Detection Results</h2>
          <p>Found {detectionResult.num_detections} object(s)</p>
          {detectionResult.detections.length > 0 ? (
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
