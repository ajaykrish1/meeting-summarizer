import { useState, useRef } from 'react'
import { Upload, Mic, FileAudio } from 'lucide-react'
import { Button } from './ui/Button'

interface UploadCardProps {
  onUpload: (file: File) => void
  isProcessing: boolean
}

export default function UploadCard({ onUpload, isProcessing }: UploadCardProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <Mic className="h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Meeting Audio
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Drag and drop an audio file here, or click to browse
        </p>

        <div
          className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="text-center">
              <FileAudio className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-sm font-medium text-gray-900 mb-2">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <Button
                onClick={handleUpload}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Transcribe Audio'}
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Supports MP3, WAV, M4A, and other audio formats
              </p>
              <Button onClick={openFileDialog} variant="outline">
                Choose File
              </Button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}
