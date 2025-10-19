import { create } from 'zustand'
import { Meeting, ActionItem, Summary, Transcript } from '../types'

interface MeetingStore {
  meetings: Meeting[]
  currentMeeting: Meeting | null
  actions: ActionItem[]
  loading: boolean
  error: string | null
  
  // Actions
  setMeetings: (meetings: Meeting[]) => void
  setCurrentMeeting: (meeting: Meeting | null) => void
  setActions: (actions: ActionItem[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  addMeeting: (meeting: Meeting) => void
  updateMeeting: (id: number, updates: Partial<Meeting>) => void
  deleteMeeting: (id: number) => void
  
  addAction: (action: ActionItem) => void
  updateAction: (id: number, updates: Partial<ActionItem>) => void
  deleteAction: (id: number) => void
  
  clearStore: () => void
}

const initialState = {
  meetings: [],
  currentMeeting: null,
  actions: [],
  loading: false,
  error: null,
}

export const useMeetingStore = create<MeetingStore>((set, get) => ({
  ...initialState,
  
  setMeetings: (meetings) => set({ meetings }),
  setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),
  setActions: (actions) => set({ actions }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addMeeting: (meeting) => set((state) => ({
    meetings: [meeting, ...state.meetings]
  })),
  
  updateMeeting: (id, updates) => set((state) => ({
    meetings: state.meetings.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ),
    currentMeeting: state.currentMeeting?.id === id 
      ? { ...state.currentMeeting, ...updates }
      : state.currentMeeting
  })),
  
  deleteMeeting: (id) => set((state) => ({
    meetings: state.meetings.filter(m => m.id !== id),
    currentMeeting: state.currentMeeting?.id === id ? null : state.currentMeeting
  })),
  
  addAction: (action) => set((state) => ({
    actions: [...state.actions, action]
  })),
  
  updateAction: (id, updates) => set((state) => ({
    actions: state.actions.map(a => 
      a.id === id ? { ...a, ...updates } : a
    )
  })),
  
  deleteAction: (id) => set((state) => ({
    actions: state.actions.filter(a => a.id !== id)
  })),
  
  clearStore: () => set(initialState),
}))
