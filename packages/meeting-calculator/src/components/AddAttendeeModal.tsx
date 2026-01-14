'use client';

import { useState } from 'react';
import { useMeetingStore } from '@/store/meetingStore';

interface AddAttendeeModalProps {
  onClose: () => void;
}

export function AddAttendeeModal({ onClose }: AddAttendeeModalProps) {
  const [inputMethod, setInputMethod] = useState<'manual' | 'ai'>('manual');
  const [salaryType, setSalaryType] = useState<'annual' | 'hourly'>('annual');
  
  // Manual input
  const [name, setName] = useState('');
  const [annualSalary, setAnnualSalary] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  
  // AI estimation input
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  
  // AI estimation result
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimationResult, setEstimationResult] = useState<any>(null);
  const [estimationError, setEstimationError] = useState('');
  
  const { addAttendee } = useMeetingStore();

  const handleSalaryChange = (value: string, type: 'annual' | 'hourly') => {
    const numValue = parseFloat(value) || 0;
    
    if (type === 'annual') {
      setAnnualSalary(value);
      setHourlyRate((numValue / 2080).toFixed(2));
    } else {
      setHourlyRate(value);
      setAnnualSalary((numValue * 2080).toFixed(0));
    }
  };

  const handleEstimateSalary = async () => {
    if (!jobTitle || !location) {
      setEstimationError('Please provide at least job title and location');
      return;
    }
    
    setIsEstimating(true);
    setEstimationError('');
    
    try {
      const response = await fetch('/api/estimate-salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          location,
          experience,
          companySize,
          industry,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to estimate salary');
      }
      
      const result = await response.json() as {
        median_salary: number;
        range_low: number;
        range_high: number;
        confidence: 'high' | 'medium' | 'low';
        notes?: string;
      };
      setEstimationResult(result);
      
      // Auto-fill the manual fields
      setAnnualSalary(result.median_salary.toString());
      setHourlyRate((result.median_salary / 2080).toFixed(2));
      setName(jobTitle);
    } catch (error) {
      console.error('Estimation error:', error);
      setEstimationError('Could not estimate salary. Please try manual entry.');
      setInputMethod('manual');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAnnualSalary = parseFloat(annualSalary) || 0;
    const finalHourlyRate = parseFloat(hourlyRate) || 0;
    
    if (!name || finalAnnualSalary === 0) {
      alert('Please provide a name and salary');
      return;
    }
    
    addAttendee({
      name,
      inputMethod: estimationResult ? 'ai_estimated' : 'manual',
      annualSalary: finalAnnualSalary,
      hourlyRate: finalHourlyRate,
      estimationData: estimationResult ? {
        jobTitle,
        location,
        experience,
        companySize,
        industry,
        confidence: estimationResult.confidence,
        range: [estimationResult.range_low, estimationResult.range_high],
      } : undefined,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Add Attendee
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Input Method Toggle */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <button
              type="button"
              onClick={() => setInputMethod('manual')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                inputMethod === 'manual'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Manual Entry
            </button>
            <button
              type="button"
              onClick={() => setInputMethod('ai')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                inputMethod === 'ai'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                AI Estimate
              </span>
            </button>
          </div>

          {inputMethod === 'manual' ? (
            <>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Name / Role
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Sarah - Senior Engineer"
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Salary Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Compensation
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setSalaryType('annual')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      salaryType === 'annual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Annual Salary
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalaryType('hourly')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      salaryType === 'hourly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Hourly Rate
                  </button>
                </div>

                {salaryType === 'annual' ? (
                  <div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="number"
                        value={annualSalary}
                        onChange={(e) => handleSalaryChange(e.target.value, 'annual')}
                        placeholder="120000"
                        className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    {hourlyRate && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        ≈ ${hourlyRate}/hour (based on 2,080 hours/year)
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={hourlyRate}
                        onChange={(e) => handleSalaryChange(e.target.value, 'hourly')}
                        placeholder="57.69"
                        className="w-full pl-8 pr-16 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">/hr</span>
                    </div>
                    {annualSalary && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        ≈ ${parseFloat(annualSalary).toLocaleString()}/year
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* AI Estimation Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Experience Level
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
                      <option value="Mid-Level (3-5 years)">Mid-Level (3-5 years)</option>
                      <option value="Senior (6-10 years)">Senior (6-10 years)</option>
                      <option value="Lead/Principal (10+ years)">Lead/Principal (10+ years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Company Size
                    </label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="Startup (<50)">Startup (&lt;50)</option>
                      <option value="Small (50-200)">Small (50-200)</option>
                      <option value="Medium (200-1,000)">Medium (200-1,000)</option>
                      <option value="Large (1,000-5,000)">Large (1,000-5,000)</option>
                      <option value="Enterprise (5,000+)">Enterprise (5,000+)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="Tech">Tech</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Education">Education</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleEstimateSalary}
                  disabled={isEstimating || !jobTitle || !location}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {isEstimating ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Estimating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      Estimate Salary
                    </>
                  )}
                </button>

                {estimationError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{estimationError}</p>
                  </div>
                )}

                {estimationResult && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        Estimated Salary
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        estimationResult.confidence === 'high'
                          ? 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100'
                          : estimationResult.confidence === 'medium'
                          ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100'
                          : 'bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100'
                      }`}>
                        {estimationResult.confidence} confidence
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      ${estimationResult.median_salary.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Range: ${estimationResult.range_low.toLocaleString()} - ${estimationResult.range_high.toLocaleString()}
                    </div>
                    {estimationResult.notes && (
                      <div className="text-xs text-green-600 dark:text-green-400 pt-2 border-t border-green-200 dark:border-green-800">
                        {estimationResult.notes}
                      </div>
                    )}
                  </div>
                )}

                {estimationResult && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                        Name / Role
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Sarah - Senior Engineer"
                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || (!annualSalary && !estimationResult)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Add Attendee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


