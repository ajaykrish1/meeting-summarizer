import { Summary } from '../types'
import { CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react'

interface SummaryPanelProps {
  summary: Summary
}

export default function SummaryPanel({ summary }: SummaryPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Meeting Summary</h2>
      
      <div className="space-y-6">
        {/* Key Points */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">Key Points</h3>
          </div>
          <ul className="space-y-2">
            {summary.bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Decisions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-gray-900">Decisions Made</h3>
          </div>
          <ul className="space-y-2">
            {summary.decisions.map((decision, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">{decision}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        {summary.risks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="font-medium text-gray-900">Risks & Concerns</h3>
            </div>
            <ul className="space-y-2">
              {summary.risks.map((risk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
