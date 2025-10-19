import { useState } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { ActionItem, CreateActionRequest, UpdateActionRequest } from '../types'
import { createAction, updateAction, deleteAction } from '../lib/api'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { toast } from './ui/Toast'

interface ActionTableProps {
  meetingId: number
  actions: ActionItem[]
  onActionsUpdate: () => void
}

const statusColors = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusIcons = {
  open: Clock,
  in_progress: AlertCircle,
  completed: CheckCircle,
  cancelled: AlertCircle,
}

export default function ActionTable({ meetingId, actions, onActionsUpdate }: ActionTableProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newAction, setNewAction] = useState<CreateActionRequest>({
    text: '',
    assignee: '',
    due_date: '',
    status: 'open',
  })
  const [editingAction, setEditingAction] = useState<UpdateActionRequest>({})

  const handleAddAction = async () => {
    if (!newAction.text.trim()) return

    try {
      await createAction(meetingId, newAction)
      setNewAction({ text: '', assignee: '', due_date: '', status: 'open' })
      setIsAdding(false)
      onActionsUpdate()
      toast({
        title: 'Success',
        description: 'Action item created successfully',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create action item',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateAction = async (id: number) => {
    try {
      await updateAction(id, editingAction)
      setEditingId(null)
      setEditingAction({})
      onActionsUpdate()
      toast({
        title: 'Success',
        description: 'Action item updated successfully',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update action item',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteAction = async (id: number) => {
    if (!confirm('Are you sure you want to delete this action item?')) return

    try {
      await deleteAction(id)
      onActionsUpdate()
      toast({
        title: 'Success',
        description: 'Action item deleted successfully',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete action item',
        variant: 'destructive',
      })
    }
  }

  const startEditing = (action: ActionItem) => {
    setEditingId(action.id)
    setEditingAction({
      text: action.text,
      assignee: action.assignee || '',
      due_date: action.due_date || '',
      status: action.status,
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingAction({})
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Action Items</h2>
        <Button
          onClick={() => setIsAdding(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Action
        </Button>
      </div>

      {/* Add New Action */}
      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="space-y-3">
            <Input
              placeholder="Action description..."
              value={newAction.text}
              onChange={(e) => setNewAction({ ...newAction, text: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Assignee (optional)"
                value={newAction.assignee}
                onChange={(e) => setNewAction({ ...newAction, assignee: e.target.value })}
              />
              <Input
                type="date"
                value={newAction.due_date}
                onChange={(e) => setNewAction({ ...newAction, due_date: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddAction} size="sm">
                Add
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Actions List */}
      <div className="space-y-3">
        {actions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No action items yet</p>
        ) : (
          actions.map((action) => (
            <div key={action.id} className="border rounded-lg p-4">
              {editingId === action.id ? (
                <div className="space-y-3">
                  <Input
                    value={editingAction.text || ''}
                    onChange={(e) => setEditingAction({ ...editingAction, text: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Assignee"
                      value={editingAction.assignee || ''}
                      onChange={(e) => setEditingAction({ ...editingAction, assignee: e.target.value })}
                    />
                    <Input
                      type="date"
                      value={editingAction.due_date || ''}
                      onChange={(e) => setEditingAction({ ...editingAction, due_date: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdateAction(action.id)} size="sm">
                      Save
                    </Button>
                    <Button onClick={cancelEditing} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">{action.text}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {action.assignee && (
                        <span>Assigned to: {action.assignee}</span>
                      )}
                      {action.due_date && (
                        <span>Due: {new Date(action.due_date).toLocaleDateString()}</span>
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[action.status]}`}>
                        {(() => {
                          const Icon = statusIcons[action.status]
                          return <Icon className="h-3 w-3 mr-1" />
                        })()}
                        {action.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => startEditing(action)}
                      variant="ghost"
                      size="sm"
                      className="p-2"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteAction(action.id)}
                      variant="ghost"
                      size="sm"
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
