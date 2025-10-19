import { useState } from 'react'
import { Download, FileText, Table } from 'lucide-react'
import { Meeting } from '../types'
import { Button } from './ui/Button'
import { downloadFile } from '../lib/utils'

interface ExportMenuProps {
  meeting: Meeting
}

export default function ExportMenu({ meeting }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const exportSummary = () => {
    if (!meeting.summary) return

    const content = `# ${meeting.title}

## Meeting Summary
**Date:** ${new Date(meeting.created_at).toLocaleDateString()}

### Key Points
${meeting.summary.bullets.map(bullet => `- ${bullet}`).join('\n')}

### Decisions Made
${meeting.summary.decisions.map(decision => `- ${decision}`).join('\n')}

${meeting.summary.risks.length > 0 ? `### Risks & Concerns
${meeting.summary.risks.map(risk => `- ${risk}`).join('\n')}` : ''}

${meeting.transcript ? `### Full Transcript
${meeting.transcript.text}` : ''}
`

    downloadFile(content, `${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.md`, 'text/markdown')
  }

  const exportActions = () => {
    if (!meeting.actions || meeting.actions.length === 0) return

    const headers = ['Action', 'Assignee', 'Due Date', 'Status', 'Created']
    const rows = meeting.actions.map(action => [
      action.text,
      action.assignee || '',
      action.due_date ? new Date(action.due_date).toLocaleDateString() : '',
      action.status.replace('_', ' '),
      new Date(action.created_at).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    downloadFile(csvContent, `${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_actions.csv`, 'text/csv')
  }

  const exportAll = () => {
    exportSummary()
    exportActions()
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              onClick={() => {
                exportSummary()
                setIsOpen(false)
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FileText className="h-4 w-4" />
              Export Summary (MD)
            </button>
            <button
              onClick={() => {
                exportActions()
                setIsOpen(false)
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Table className="h-4 w-4" />
              Export Actions (CSV)
            </button>
            <button
              onClick={() => {
                exportAll()
                setIsOpen(false)
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
            >
              <Download className="h-4 w-4" />
              Export All
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
