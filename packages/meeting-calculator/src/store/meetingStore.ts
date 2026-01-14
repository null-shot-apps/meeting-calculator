import { create } from 'zustand';

export interface Attendee {
  id: string;
  name: string;
  inputMethod: 'manual' | 'ai_estimated';
  annualSalary: number;
  hourlyRate: number;
  estimationData?: {
    jobTitle: string;
    location: string;
    experience: string;
    companySize?: string;
    industry?: string;
    confidence: 'high' | 'medium' | 'low';
    range: [number, number];
  };
}

export interface Meeting {
  id: string;
  name: string;
  startTime: number | null;
  elapsedTime: number; // in seconds
  status: 'idle' | 'running' | 'paused' | 'ended';
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'custom';
  customFrequency?: number; // times per month
  overheadMultiplier: number;
  currency: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface MeetingHistoryEntry {
  id: string;
  name: string;
  date: number;
  duration: number;
  finalCost: number;
  attendeeCount: number;
  attendees: Attendee[];
}

export interface Template {
  id: string;
  name: string;
  attendees: Attendee[];
  overheadMultiplier: number;
}

interface MeetingStore {
  meeting: Meeting;
  attendees: Attendee[];
  history: MeetingHistoryEntry[];
  templates: Template[];
  
  // Meeting actions
  startMeeting: () => void;
  pauseMeeting: () => void;
  resumeMeeting: () => void;
  resetMeeting: () => void;
  endMeeting: () => void;
  updateElapsedTime: () => void;
  
  // Attendee actions
  addAttendee: (attendee: Omit<Attendee, 'id'>) => void;
  removeAttendee: (id: string) => void;
  updateAttendee: (id: string, updates: Partial<Attendee>) => void;
  duplicateAttendee: (id: string) => void;
  
  // Settings actions
  updateMeetingSettings: (settings: Partial<Meeting>) => void;
  
  // Template actions
  saveTemplate: (name: string) => void;
  loadTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  
  // History actions
  addToHistory: (entry: Omit<MeetingHistoryEntry, 'id'>) => void;
  deleteHistoryEntry: (id: string) => void;
  clearHistory: () => void;
  
  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

const defaultMeeting: Meeting = {
  id: generateId(),
  name: 'Untitled Meeting',
  startTime: null,
  elapsedTime: 0,
  status: 'idle',
  frequency: 'one-time',
  overheadMultiplier: 1.5,
  currency: 'USD',
  theme: 'auto',
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useMeetingStore = create<MeetingStore>((set, get) => ({
  meeting: defaultMeeting,
  attendees: [],
  history: [],
  templates: [],
  
  startMeeting: () => {
    set((state) => ({
      meeting: {
        ...state.meeting,
        status: 'running',
        startTime: Date.now(),
        elapsedTime: 0,
      },
    }));
    get().saveToLocalStorage();
  },
  
  pauseMeeting: () => {
    set((state) => ({
      meeting: { ...state.meeting, status: 'paused' },
    }));
    get().saveToLocalStorage();
  },
  
  resumeMeeting: () => {
    set((state) => ({
      meeting: { ...state.meeting, status: 'running' },
    }));
    get().saveToLocalStorage();
  },
  
  resetMeeting: () => {
    set((state) => ({
      meeting: {
        ...state.meeting,
        startTime: null,
        elapsedTime: 0,
        status: 'idle',
      },
    }));
    get().saveToLocalStorage();
  },
  
  endMeeting: () => {
    const state = get();
    const totalCost = state.attendees.reduce((total, attendee) => {
      const hours = state.meeting.elapsedTime / 3600;
      return total + (attendee.hourlyRate * hours * state.meeting.overheadMultiplier);
    }, 0);
    
    // Add to history
    get().addToHistory({
      name: state.meeting.name,
      date: Date.now(),
      duration: state.meeting.elapsedTime,
      finalCost: totalCost,
      attendeeCount: state.attendees.length,
      attendees: state.attendees,
    });
    
    set((state) => ({
      meeting: { ...state.meeting, status: 'ended' },
    }));
    get().saveToLocalStorage();
  },
  
  updateElapsedTime: () => {
    set((state) => {
      if (state.meeting.status !== 'running' || !state.meeting.startTime) {
        return state;
      }
      
      return {
        meeting: {
          ...state.meeting,
          elapsedTime: state.meeting.elapsedTime + 1,
        },
      };
    });
  },
  
  addAttendee: (attendee) => {
    set((state) => ({
      attendees: [...state.attendees, { ...attendee, id: generateId() }],
    }));
    get().saveToLocalStorage();
  },
  
  removeAttendee: (id) => {
    set((state) => ({
      attendees: state.attendees.filter((a) => a.id !== id),
    }));
    get().saveToLocalStorage();
  },
  
  updateAttendee: (id, updates) => {
    set((state) => ({
      attendees: state.attendees.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
    get().saveToLocalStorage();
  },
  
  duplicateAttendee: (id) => {
    const attendee = get().attendees.find((a) => a.id === id);
    if (attendee) {
      get().addAttendee({
        ...attendee,
        name: `${attendee.name} (Copy)`,
      });
    }
  },
  
  updateMeetingSettings: (settings) => {
    set((state) => ({
      meeting: { ...state.meeting, ...settings },
    }));
    get().saveToLocalStorage();
  },
  
  saveTemplate: (name) => {
    const state = get();
    const template: Template = {
      id: generateId(),
      name,
      attendees: state.attendees,
      overheadMultiplier: state.meeting.overheadMultiplier,
    };
    
    set((state) => ({
      templates: [...state.templates, template],
    }));
    get().saveToLocalStorage();
  },
  
  loadTemplate: (id) => {
    const template = get().templates.find((t) => t.id === id);
    if (template) {
      set({
        attendees: template.attendees.map((a) => ({ ...a, id: generateId() })),
        meeting: {
          ...get().meeting,
          overheadMultiplier: template.overheadMultiplier,
        },
      });
      get().saveToLocalStorage();
    }
  },
  
  deleteTemplate: (id) => {
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    }));
    get().saveToLocalStorage();
  },
  
  addToHistory: (entry) => {
    set((state) => ({
      history: [{ ...entry, id: generateId() }, ...state.history].slice(0, 50), // Keep last 50
    }));
    get().saveToLocalStorage();
  },
  
  deleteHistoryEntry: (id) => {
    set((state) => ({
      history: state.history.filter((h) => h.id !== id),
    }));
    get().saveToLocalStorage();
  },
  
  clearHistory: () => {
    set({ history: [] });
    get().saveToLocalStorage();
  },
  
  saveToLocalStorage: () => {
    const state = get();
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('meeting-calculator', JSON.stringify({
          meeting: state.meeting,
          attendees: state.attendees,
          history: state.history,
          templates: state.templates,
        }));
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  loadFromLocalStorage: () => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('meeting-calculator');
        if (saved) {
          const data = JSON.parse(saved);
          set({
            meeting: data.meeting || defaultMeeting,
            attendees: data.attendees || [],
            history: data.history || [],
            templates: data.templates || [],
          });
        }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  },
}));

