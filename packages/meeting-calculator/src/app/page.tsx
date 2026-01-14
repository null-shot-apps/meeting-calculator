'use client';

import { useState, useEffect, useCallback } from 'react';
import { MeetingTimer } from '@/components/MeetingTimer';
import { AttendeeList } from '@/components/AttendeeList';
import { SettingsPanel } from '@/components/SettingsPanel';
import { MeetingHistory } from '@/components/MeetingHistory';
import { MeetingSummary } from '@/components/MeetingSummary';
import { useMeetingStore } from '@/store/meetingStore';

export default function MeetingCalculator() {
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  const {
    meeting,
    attendees,
    startMeeting,
    pauseMeeting,
    resumeMeeting,
    resetMeeting,
    updateElapsedTime,
    loadFromLocalStorage,
  } = useMeetingStore();

  // Load saved data on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (meeting.status === 'running') {
      interval = setInterval(() => {
        updateElapsedTime();
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [meeting.status, updateElapsedTime]);

  // Calculate total cost
  const calculateTotalCost = useCallback(() => {
    const hours = meeting.elapsedTime / 3600;
    return attendees.reduce((total, attendee) => {
      return total + (attendee.hourlyRate * hours * meeting.overheadMultiplier);
    }, 0);
  }, [attendees, meeting.elapsedTime, meeting.overheadMultiplier]);

  // Calculate cost per minute
  const calculateCostPerMinute = useCallback(() => {
    return attendees.reduce((total, attendee) => {
      return total + ((attendee.hourlyRate / 60) * meeting.overheadMultiplier);
    }, 0);
  }, [attendees, meeting.overheadMultiplier]);

  const totalCost = calculateTotalCost();
  const costPerMinute = calculateCostPerMinute();

  // Handle reset with confirmation
  const handleReset = () => {
    if (totalCost > 0) {
      if (confirm(`This will clear $${totalCost.toFixed(2)} - continue?`)) {
        resetMeeting();
      }
    } else {
      resetMeeting();
    }
  };

  // Handle page unload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (meeting.status === 'running') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [meeting.status]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === ' ') {
        e.preventDefault();
        if (meeting.status === 'idle') {
          if (attendees.length > 0) startMeeting();
        } else if (meeting.status === 'running') {
          pauseMeeting();
        } else if (meeting.status === 'paused') {
          resumeMeeting();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      } else if (e.key === 'Escape') {
        setShowSettings(false);
        setShowHistory(false);
        setShowSummary(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [meeting.status, attendees.length, startMeeting, pauseMeeting, resumeMeeting]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Meeting Cost Calculator
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Time is money. Literally.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                title="Meeting History"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Timer Display */}
          <div className="space-y-6">
            <MeetingTimer
              totalCost={totalCost}
              costPerMinute={costPerMinute}
              elapsedTime={meeting.elapsedTime}
              status={meeting.status}
              onStart={startMeeting}
              onPause={pauseMeeting}
              onResume={resumeMeeting}
              onReset={handleReset}
              onShowSummary={() => setShowSummary(true)}
              attendeeCount={attendees.length}
            />
          </div>

          {/* Right Column - Attendees */}
          <div>
            <AttendeeList />
          </div>
        </div>
      </main>

      {/* Modals */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
      
      {showHistory && (
        <MeetingHistory onClose={() => setShowHistory(false)} />
      )}
      
      {showSummary && meeting.status === 'ended' && (
        <MeetingSummary
          totalCost={totalCost}
          duration={meeting.elapsedTime}
          attendeeCount={attendees.length}
          costPerMinute={costPerMinute}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}

