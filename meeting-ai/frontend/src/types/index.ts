export interface Meeting {
  id: number
  title: string
  created_at: string
  transcript?: Transcript
  summary?: Summary
  actions?: ActionItem[]
}

export interface Transcript {
  id: number
  text: string
  duration_sec?: number
  created_at: string
}

export interface Summary {
  id: number
  bullets: string[]
  decisions: string[]
  risks: string[]
  created_at: string
}

export interface ActionItem {
  id: number
  text: string
  assignee?: string
  due_date?: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface CreateMeetingRequest {
  title: string
}

export interface CreateActionRequest {
  text: string
  assignee?: string
  due_date?: string
  status?: string
}

export interface UpdateActionRequest {
  text?: string
  assignee?: string
  due_date?: string
  status?: string
}

export interface TranscriptionResponse {
  text: string
  duration_sec?: number
}

export interface SummaryResponse {
  bullets: string[]
  decisions: string[]
  risks: string[]
  actions: CreateActionRequest[]
}
