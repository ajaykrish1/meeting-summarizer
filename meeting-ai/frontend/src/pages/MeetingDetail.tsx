import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Trash2 } from 'lucide-react'
import { useMeetingStore } from '../store/useMeetingStore'
import { getMeeting, uploadAudio, summarize, deleteMeeting } from '../lib/api'
import { Meeting } from '../types'
import TopBar from '../components/TopBar'
import UploadCard from '../components/UploadCard'
import SummaryPanel from '../components/SummaryPanel'
import ActionTable from '../components/ActionTable'
import ExportMenu from '../components/ExportMenu'
import { Button } from '../components/ui/Button'
import { toast } from '../components/ui/Toast'

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentMeeting, setCurrentMeeting, loading, setLoading, error, setError } = useMeetingStore()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (id) {
      loadMeeting(parseInt(id))
    }
  }, [id])

  const loadMeeting = async (meetingId: number) => {
    try {
      setLoading(true)
      const meeting = await getMeeting(meetingId)
      setCurrentMeeting(meeting)
    } catch (err) {
      setError('Failed to load meeting')
      toast({
        title: 'Error',
        description: 'Failed to load meeting',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAudioUpload = async (file: File) => {
    if (!currentMeeting) return

    try {
      setIsProcessing(true)
      await uploadAudio(currentMeeting.id, file)
      await loadMeeting(currentMeeting.id)
      toast({
        title: 'Success',
        description: 'Audio uploaded and transcribed successfully',
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: typeof err?.message === 'string' ? err.message : 'Failed to transcribe audio',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSummarize = async () => {
    if (!currentMeeting) return

    try {
      setIsProcessing(true)
      await summarize(currentMeeting.id)
      await loadMeeting(currentMeeting.id)
      toast({
        title: 'Success',
        description: 'Meeting summarized successfully',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to summarize meeting',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteMeeting = async () => {
    if (!currentMeeting || !confirm('Are you sure you want to delete this meeting?')) return

    try {
      await deleteMeeting(currentMeeting.id)
      toast({
        title: 'Success',
        description: 'Meeting deleted successfully',
      })
      navigate('/')
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete meeting',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meeting...</p>
        </div>
      </div>
    )
  }

  if (!currentMeeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Meeting not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentMeeting.title}</h1>
              <p className="text-gray-600">
                Created {new Date(currentMeeting.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ExportMenu meeting={currentMeeting} />
            <Button
              variant="destructive"
              onClick={handleDeleteMeeting}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Transcript */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Card */}
            {!currentMeeting.transcript && (
              <UploadCard
                onUpload={handleAudioUpload}
                isProcessing={isProcessing}
              />
            )}

            {/* Transcript */}
            {currentMeeting.transcript && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Transcript</h2>
                  <Button
                    onClick={handleSummarize}
                    disabled={isProcessing || !!currentMeeting.summary}
                    className="flex items-center gap-2"
                  >
                    {isProcessing ? 'Processing...' : 'Generate Summary'}
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {currentMeeting.transcript.text}
                  </p>
                </div>
                {currentMeeting.transcript.duration_sec && (
                  <p className="text-sm text-gray-500 mt-2">
                    Duration: {Math.round(currentMeeting.transcript.duration_sec / 60)} minutes
                  </p>
                )}
              </div>
            )}

            {/* Summary */}
            {currentMeeting.summary && (
              <SummaryPanel summary={currentMeeting.summary} />
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            <ActionTable
              meetingId={currentMeeting.id}
              actions={currentMeeting.actions || []}
              onActionsUpdate={() => loadMeeting(currentMeeting.id)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
