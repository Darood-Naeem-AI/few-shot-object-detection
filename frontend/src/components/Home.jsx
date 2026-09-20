export default function Home({ onNavigate }) {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Few-Shot Object Detection</h1>
        <p className="subtitle">Detect novel objects with minimal examples</p>
        
        <div className="info-section">
          <h2>How it works:</h2>
          <ul>
            <li><strong>1-shot:</strong> Detect with just 1 example image</li>
            <li><strong>5-shot:</strong> Detect with 5 example images</li>
            <li><strong>10-shot:</strong> Detect with 10 example images</li>
          </ul>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => onNavigate('upload')}
        >
          Start Detection
        </button>
      </div>
    </div>
  )
}
