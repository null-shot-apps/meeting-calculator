'use client';

import { useMeetingStore } from '@/store/meetingStore';

interface MeetingHistoryProps {
  onClose: () => void;
}

export function MeetingHistory({ onClose }: MeetingHistoryProps) {
  const { history, deleteHistoryEntry, clearHistory } = useMeetingStore();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const totalSpent = history.reduce((sum, entry) => sum + entry.finalCost, 0);
  const mostExpensive = history.length > 0 
    ? Math.max(...history.map(h => h.finalCost))
    : 0;
  const averageCost = history.length > 0
    ? totalSpent / history.length
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Meeting History
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {history.length > 0 && (
            <>
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                    Total Spent
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ${totalSpent.toFixed(2)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                    Most Expensive
                  </div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    ${mostExpensive.toFixed(2)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                    Average Cost
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    ${averageCost.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                  Past Meetings ({history.length})
                </h3>
                <button
                  onClick={() => {
                    if (confirm('Clear all history?')) {
                      clearHistory();
                    }
                  }}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                >
                  Clear All
                </button>
              </div>
            </>
          )}

          {history.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No meeting history yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Your completed meetings will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                        {entry.name}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span>{formatDate(entry.date)}</span>
                        <span>•</span>
                        <span>{formatDuration(entry.duration)}</span>
                        <span>•</span>
                        <span>{entry.attendeeCount} attendees</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-900 dark:text-white">
                          ${entry.finalCost.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ${(entry.finalCost / (entry.duration / 60)).toFixed(2)}/min
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Delete this entry?')) {
                            deleteHistoryEntry(entry.id);
                          }
                        }}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Attendee details - expandable */}
                  <details className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                    <summary className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      View attendees
                    </summary>
                    <div className="mt-2 space-y-1">
                      {entry.attendees.map((attendee) => (
                        <div key={attendee.id} className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                          <span>{attendee.name}</span>
                          <span>${attendee.hourlyRate.toFixed(2)}/hr</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

