'use client';

import { useMeetingStore } from '@/store/meetingStore';

interface MeetingSummaryProps {
  totalCost: number;
  duration: number;
  attendeeCount: number;
  costPerMinute: number;
  onClose: () => void;
}

export function MeetingSummary({
  totalCost,
  duration,
  attendeeCount,
  costPerMinute,
  onClose,
}: MeetingSummaryProps) {
  const { endMeeting } = useMeetingStore();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getMeetingGrade = () => {
    let score = 100;
    
    // Penalize long meetings
    if (duration > 3600) score -= 20; // > 1 hour
    else if (duration > 2700) score -= 10; // > 45 min
    
    // Penalize many attendees
    if (attendeeCount > 8) score -= 20;
    else if (attendeeCount > 5) score -= 10;
    
    // Penalize high cost
    if (totalCost > 1000) score -= 20;
    else if (totalCost > 500) score -= 10;
    
    if (score >= 90) return { grade: 'A', color: 'green', message: 'Excellent efficiency!' };
    if (score >= 80) return { grade: 'B', color: 'blue', message: 'Good meeting' };
    if (score >= 70) return { grade: 'C', color: 'yellow', message: 'Could be improved' };
    if (score >= 60) return { grade: 'D', color: 'orange', message: 'Consider optimizing' };
    return { grade: 'F', color: 'red', message: 'High cost meeting' };
  };

  const getInsights = () => {
    const insights = [];
    
    if (duration < 600) {
      insights.push({
        icon: '📧',
        text: 'This could have been an email',
        type: 'info',
      });
    }
    
    if (attendeeCount > 8) {
      insights.push({
        icon: '👥',
        text: 'Consider if everyone needed to be here',
        type: 'warning',
      });
    }
    
    if (totalCost > 1000) {
      insights.push({
        icon: '💰',
        text: 'High-impact meeting - was it worth it?',
        type: 'warning',
      });
    }
    
    if (duration > 3600) {
      insights.push({
        icon: '⏰',
        text: 'Long meeting - could it be split into smaller sessions?',
        type: 'info',
      });
    }
    
    return insights;
  };

  const getComparisons = () => {
    return [
      {
        label: 'Junior developer hours',
        value: Math.floor(totalCost / 30),
        unit: 'hours',
      },
      {
        label: 'Team lunches',
        value: Math.floor(totalCost / 200),
        unit: 'lunches',
      },
      {
        label: 'Monthly SaaS subscriptions',
        value: Math.floor(totalCost / 50),
        unit: 'subscriptions',
      },
    ];
  };

  const handleShare = () => {
    const text = `Meeting Summary
Duration: ${formatDuration(duration)}
Attendees: ${attendeeCount}
Total Cost: $${totalCost.toFixed(2)}
Cost per minute: $${costPerMinute.toFixed(2)}`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Summary copied to clipboard!');
    }
  };

  const handleEnd = () => {
    endMeeting();
    onClose();
  };

  const grade = getMeetingGrade();
  const insights = getInsights();
  const comparisons = getComparisons();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Meeting Summary
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

        <div className="p-6 space-y-6">
          {/* Meeting Grade */}
          <div className={`bg-gradient-to-br from-${grade.color}-50 to-${grade.color}-100 dark:from-${grade.color}-900/20 dark:to-${grade.color}-800/20 rounded-2xl p-6 border border-${grade.color}-200 dark:border-${grade.color}-800 text-center`}>
            <div className={`text-6xl font-bold text-${grade.color}-600 dark:text-${grade.color}-400 mb-2`}>
              {grade.grade}
            </div>
            <div className={`text-lg font-medium text-${grade.color}-900 dark:text-${grade.color}-100`}>
              {grade.message}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Total Cost
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                ${totalCost.toFixed(2)}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Duration
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatDuration(duration)}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Cost per Minute
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                ${costPerMinute.toFixed(2)}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Attendees
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {attendeeCount}
              </div>
            </div>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">
                Insights
              </h3>
              <div className="space-y-2">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      insight.type === 'warning'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <span className="text-2xl">{insight.icon}</span>
                    <span className={`text-sm ${
                      insight.type === 'warning'
                        ? 'text-yellow-900 dark:text-yellow-100'
                        : 'text-blue-900 dark:text-blue-100'
                    }`}>
                      {insight.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Comparisons */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">
              This Meeting Cost Equals
            </h3>
            <div className="space-y-2">
              {comparisons.map((comparison, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {comparison.label}
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {comparison.value} {comparison.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Summary
            </button>
            
            <button
              onClick={handleEnd}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              End Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

