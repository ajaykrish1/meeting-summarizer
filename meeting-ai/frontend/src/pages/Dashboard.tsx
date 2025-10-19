import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Mic, FileText, CheckCircle, Clock } from 'lucide-react'
import { useMeetingStore } from '../store/useMeetingStore'
import { getMeetings, createMeeting, getStats as fetchStats } from '../lib/api'
import { CreateMeetingRequest } from '../types'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from '../components/ui/Toast'

export default function Dashboard() {
  const navigate = useNavigate()
  const { meetings, setMeetings, loading, setLoading, error, setError } = useMeetingStore()
  const [newMeetingTitle, setNewMeetingTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [serverStats, setServerStats] = useState<{ total_meetings: number; transcribed_count: number; summarized_count: number; action_items_count: number } | null>(null)

  useEffect(() => {
    loadMeetings()
    loadStats()
  }, [])

  const loadMeetings = async () => {
    try {
      setLoading(true)
      const data = await getMeetings()
      setMeetings(data)
    } catch (err) {
      setError('Failed to load meetings')
      toast({
        title: 'Error',
        description: 'Failed to load meetings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMeeting = async () => {
    if (!newMeetingTitle.trim()) return

    try {
      setIsCreating(true)
      const meeting = await createMeeting({ title: newMeetingTitle.trim() })
      setMeetings([meeting, ...meetings])
      setNewMeetingTitle('')
      toast({
        title: 'Success',
        description: 'Meeting created successfully',
      })
      navigate(`/m/${meeting.id}`)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create meeting',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const loadStats = async () => {
    try {
      const s = await fetchStats()
      setServerStats(s)
    } catch (err) {
      // Non-blocking; fall back to client-side computed stats
    }
  }

  const computeStats = () => {
    const totalMeetings = meetings.length
    const meetingsWithTranscript = meetings.filter(m => m.transcript).length
    const meetingsWithSummary = meetings.filter(m => m.summary).length
    const totalActions = meetings.reduce((sum, m) => sum + (m.actions?.length || 0), 0)

    return { totalMeetings, meetingsWithTranscript, meetingsWithSummary, totalActions }
  }

  const stats = serverStats
    ? {
        totalMeetings: serverStats.total_meetings,
        meetingsWithTranscript: serverStats.transcribed_count,
        meetingsWithSummary: serverStats.summarized_count,
        totalActions: serverStats.action_items_count,
      }
    : computeStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meeting Summarizer</h1>
          <p className="mt-2 text-gray-600">
            Upload meeting audio, get AI-powered summaries, and track action items
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Meetings"
            value={stats.totalMeetings}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Transcribed"
            value={stats.meetingsWithTranscript}
            icon={Mic}
            color="green"
          />
          <StatCard
            title="Summarized"
            value={stats.meetingsWithSummary}
            icon={FileText}
            color="purple"
          />
          <StatCard
            title="Action Items"
            value={stats.totalActions}
            icon={CheckCircle}
            color="orange"
          />
        </div>

        {/* New Meeting */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Meeting</h2>
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter meeting title..."
              value={newMeetingTitle}
              onChange={(e) => setNewMeetingTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateMeeting()}
              className="flex-1"
            />
            <Button
              onClick={handleCreateMeeting}
              disabled={!newMeetingTitle.trim() || isCreating}
              className="px-6"
            >
              {isCreating ? 'Creating...' : 'Create Meeting'}
            </Button>
          </div>
        </div>

        {/* Meetings List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Meetings</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading meetings...</div>
          ) : meetings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No meetings yet. Create your first meeting to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/m/${meeting.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(meeting.created_at).toLocaleDateString()}</span>
                        {meeting.transcript && (
                          <span className="flex items-center gap-1">
                            <Mic className="h-4 w-4" />
                            Transcribed
                          </span>
                        )}
                        {meeting.summary && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Summarized
                          </span>
                        )}
                        {meeting.actions && meeting.actions.length > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            {meeting.actions.length} actions
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!meeting.transcript && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      )}
                      {meeting.transcript && !meeting.summary && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Ready to summarize
                        </span>
                      )}
                      {meeting.summary && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Complete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
