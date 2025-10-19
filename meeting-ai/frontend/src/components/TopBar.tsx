import { Link } from 'react-router-dom'
import { Mic, FileText } from 'lucide-react'

export default function TopBar() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Mic className="h-8 w-8 text-blue-600" />
            <span>Meeting AI</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <a
              href="https://github.com/your-repo/meeting-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
