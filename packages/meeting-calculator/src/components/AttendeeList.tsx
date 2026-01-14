'use client';

import { useState } from 'react';
import { useMeetingStore } from '@/store/meetingStore';
import { AttendeeCard } from './AttendeeCard';
import { AddAttendeeModal } from './AddAttendeeModal';

export function AttendeeList() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { attendees, meeting } = useMeetingStore();

  // Calculate individual costs
  const getAttendeeCost = (hourlyRate: number) => {
    const hours = meeting.elapsedTime / 3600;
    return hourlyRate * hours * meeting.overheadMultiplier;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Attendees
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {attendees.length} {attendees.length === 1 ? 'person' : 'people'} in this meeting
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Attendee
        </button>
      </div>

      {attendees.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No attendees yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Add your first attendee to start calculating meeting costs
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add First Attendee
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {attendees.map((attendee) => (
            <AttendeeCard
              key={attendee.id}
              attendee={attendee}
              currentCost={getAttendeeCost(attendee.hourlyRate)}
            />
          ))}
        </div>
      )}

      {/* Quick Presets */}
      {attendees.length === 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Quick Add Presets
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <PresetButton
              label="C-Suite"
              salary={300000}
              onClick={() => setShowAddModal(true)}
            />
            <PresetButton
              label="Senior"
              salary={135000}
              onClick={() => setShowAddModal(true)}
            />
            <PresetButton
              label="Mid-level"
              salary={90000}
              onClick={() => setShowAddModal(true)}
            />
            <PresetButton
              label="Junior"
              salary={60000}
              onClick={() => setShowAddModal(true)}
            />
          </div>
        </div>
      )}

      {showAddModal && (
        <AddAttendeeModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function PresetButton({ label, salary, onClick }: { label: string; salary: number; onClick: () => void }) {
  const hourlyRate = salary / 2080;
  
  return (
    <button
      onClick={onClick}
      className="p-3 text-left bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
    >
      <div className="font-medium text-slate-900 dark:text-white text-sm">
        {label}
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
        ${hourlyRate.toFixed(2)}/hr
      </div>
    </button>
  );
}

