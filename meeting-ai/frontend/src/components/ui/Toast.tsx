import { createContext, useContext, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toastData, id }
    setToasts(prev => [...prev, newToast])

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id)
    }, 5000)
  }

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const toast = (toastData: Omit<Toast, 'id'>) => {
  // This will be replaced by the context when the provider is used
  console.log('Toast:', toastData)
}

function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-white border rounded-lg shadow-lg p-4 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
            toast.variant === 'destructive' ? 'border-red-200' : 
            toast.variant === 'success' ? 'border-green-200' : 
            'border-gray-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {toast.variant === 'destructive' && <AlertCircle className="h-5 w-5 text-red-600" />}
              {toast.variant === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {!toast.variant && <Info className="h-5 w-5 text-blue-600" />}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{toast.title}</h4>
              {toast.description && (
                <p className="text-sm text-gray-600 mt-1">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export { Toaster }
