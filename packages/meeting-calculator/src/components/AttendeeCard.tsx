'use client';

import { useState } from 'react';
import { Attendee, useMeetingStore } from '@/store/meetingStore';

interface AttendeeCardProps {
  attendee: Attendee;
  currentCost: number;
}

export function AttendeeCard({ attendee, currentCost }: AttendeeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { removeAttendee, duplicateAttendee, updateAttendee } = useMeetingStore();

  const handleRemove = () => {
    if (confirm(`Remove ${attendee.name}?`)) {
      removeAttendee(attendee.id);
    }
  };

  const handleDuplicate = () => {
    duplicateAttendee(attendee.id);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={attendee.name}
              onChange={(e) => updateAttendee(attendee.id, { name: e.target.value })}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditing(false);
              }}
              className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white font-medium"
              autoFocus
            />
          ) : (
            <h3
              onClick={() => setIsEditing(true)}
              className="text-slate-900 dark:text-white font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 truncate"
            >
              {attendee.name}
            </h3>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-sm">
            <div className="text-slate-600 dark:text-slate-400">
              ${attendee.annualSalary.toLocaleString()}/yr
            </div>
            <div className="text-slate-400 dark:text-slate-500">•</div>
            <div className="text-slate-600 dark:text-slate-400">
              ${attendee.hourlyRate.toFixed(2)}/hr
            </div>
          </div>
          
          {attendee.inputMethod === 'ai_estimated' && attendee.estimationData && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                AI Estimated
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                attendee.estimationData.confidence === 'high'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : attendee.estimationData.confidence === 'medium'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
              }`}>
                {attendee.estimationData.confidence} confidence
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              ${currentCost.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              current cost
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleDuplicate}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-400 transition-colors"
              title="Duplicate"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            
            <button
              onClick={handleRemove}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Remove"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

