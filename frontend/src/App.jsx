import { useState } from 'react'
import Home from './components/Home'
import ImageUploader from './components/ImageUploader'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [uploadedImages, setUploadedImages] = useState({
    support: [],
    query: null
  })

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  return (
    <div className="App">
      {currentPage === 'home' && (
        <Home onNavigate={handleNavigate} />
      )}
      {currentPage === 'upload' && (
        <ImageUploader 
          onNavigate={handleNavigate}
          uploadedImages={uploadedImages}
          setUploadedImages={setUploadedImages}
        />
      )}
    </div>
  )
}

export default App
