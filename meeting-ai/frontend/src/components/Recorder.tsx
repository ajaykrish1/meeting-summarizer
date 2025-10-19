import { useState, useRef } from 'react'
import { Mic, Square, Download } from 'lucide-react'
import { Button } from './ui/Button'

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void
}

export default function Recorder({ onRecordingComplete }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioURL(audioUrl)
        onRecordingComplete(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const downloadRecording = () => {
    if (audioURL) {
      const a = document.createElement('a')
      a.href = audioURL
      a.download = 'meeting-recording.wav'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <Mic className="h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Record Meeting Audio
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Record audio directly in your browser
        </p>

        <div className="space-y-4">
          {!isRecording && !audioURL && (
            <Button
              onClick={startRecording}
              className="w-full flex items-center justify-center gap-2"
            >
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                Recording...
              </div>
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="w-full flex items-center justify-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            </div>
          )}

          {audioURL && (
            <div className="space-y-4">
              <audio controls className="w-full">
                <source src={audioURL} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
              <div className="flex gap-2">
                <Button
                  onClick={downloadRecording}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={() => {
                    setAudioURL(null)
                    audioChunksRef.current = []
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Record Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
