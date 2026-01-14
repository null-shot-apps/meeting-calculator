'use client';

import { useMeetingStore } from '@/store/meetingStore';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { meeting, updateMeetingSettings, templates, saveTemplate, loadTemplate, deleteTemplate } = useMeetingStore();

  const handleSaveTemplate = () => {
    const name = prompt('Enter template name:');
    if (name) {
      saveTemplate(name);
      alert('Template saved!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Settings
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
          {/* Overhead Multiplier */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Overhead Multiplier
              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
                (Accounts for benefits, taxes, office costs)
              </span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.1"
                value={meeting.overheadMultiplier}
                onChange={(e) => updateMeetingSettings({ overheadMultiplier: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-lg font-bold text-slate-900 dark:text-white w-12">
                {meeting.overheadMultiplier.toFixed(1)}x
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Each $100K salary costs company ~${(100000 * meeting.overheadMultiplier).toLocaleString()}
            </p>
          </div>

          {/* Meeting Frequency */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Meeting Frequency
            </label>
            <select
              value={meeting.frequency}
              onChange={(e) => updateMeetingSettings({ frequency: e.target.value as any })}
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="one-time">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
            
            {meeting.frequency === 'custom' && (
              <div className="mt-3">
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Times per month
                </label>
                <input
                  type="number"
                  min="1"
                  value={meeting.customFrequency || 1}
                  onChange={(e) => updateMeetingSettings({ customFrequency: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Currency
            </label>
            <select
              value={meeting.currency}
              onChange={(e) => updateMeetingSettings({ currency: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'auto'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateMeetingSettings({ theme })}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    meeting.theme === theme
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                Meeting Templates
              </h3>
              <button
                onClick={handleSaveTemplate}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Save Current
              </button>
            </div>

            {templates.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
                No saved templates yet
              </p>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {template.name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {template.attendees.length} attendees • {template.overheadMultiplier}x overhead
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          loadTemplate(template.id);
                          onClose();
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-medium transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this template?')) {
                            deleteTemplate(template.id);
                          }
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

