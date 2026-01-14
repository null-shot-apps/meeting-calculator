'use client';

import { useEffect, useState } from 'react';

interface MeetingTimerProps {
  totalCost: number;
  costPerMinute: number;
  elapsedTime: number;
  status: 'idle' | 'running' | 'paused' | 'ended';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onShowSummary: () => void;
  attendeeCount: number;
}

export function MeetingTimer({
  totalCost,
  costPerMinute,
  elapsedTime,
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onShowSummary,
  attendeeCount,
}: MeetingTimerProps) {
  const [displayCost, setDisplayCost] = useState(totalCost);

  // Smooth cost animation
  useEffect(() => {
    const diff = totalCost - displayCost;
    if (Math.abs(diff) > 0.01) {
      const timer = setTimeout(() => {
        setDisplayCost(displayCost + diff * 0.3);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [totalCost, displayCost]);

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get color based on cost
  const getCostColor = (): string => {
    if (totalCost < 100) return 'text-green-600 dark:text-green-400';
    if (totalCost < 500) return 'text-yellow-600 dark:text-yellow-400';
    if (totalCost < 1000) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Get gradient based on cost
  const getCostGradient = (): string => {
    if (totalCost < 100) return 'from-green-500/10 to-green-600/10';
    if (totalCost < 500) return 'from-yellow-500/10 to-yellow-600/10';
    if (totalCost < 1000) return 'from-orange-500/10 to-orange-600/10';
    return 'from-red-500/10 to-red-600/10';
  };

  return (
    <div className="space-y-6">
      {/* Main Cost Display */}
      <div className={`relative bg-gradient-to-br ${getCostGradient()} rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden`}>
        {/* Floating background elements */}
        {status === 'running' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-current opacity-5 rounded-full animate-float-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-current opacity-5 rounded-full animate-float-slower" />
          </div>
        )}
        
        <div className="relative z-10 text-center">
          <div className="mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Meeting Cost
            </span>
          </div>
          
          <div className={`text-7xl md:text-8xl font-bold ${getCostColor()} transition-colors duration-500 ${status === 'running' ? 'animate-pulse-subtle' : ''}`}>
            ${displayCost.toFixed(2)}
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-8 text-slate-600 dark:text-slate-400">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-xs uppercase tracking-wide mt-1">
                Elapsed Time
              </div>
            </div>
            
            <div className="h-12 w-px bg-slate-300 dark:bg-slate-600" />
            
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                ${costPerMinute.toFixed(2)}
              </div>
              <div className="text-xs uppercase tracking-wide mt-1">
                Per Minute
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center gap-4">
          {status === 'idle' && (
            <button
              onClick={onStart}
              disabled={attendeeCount === 0}
              className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start Meeting
            </button>
          )}
          
          {status === 'running' && (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              Pause
            </button>
          )}
          
          {status === 'paused' && (
            <>
              <button
                onClick={onResume}
                className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Resume
              </button>
              
              <button
                onClick={() => {
                  onPause();
                  onShowSummary();
                }}
                className="flex items-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                End & Summary
              </button>
            </>
          )}
          
          {status !== 'idle' && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-6 py-4 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          )}
        </div>
        
        {attendeeCount === 0 && status === 'idle' && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
            Add attendees to start calculating
          </p>
        )}
        
        {status !== 'idle' && (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
            Press <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">Space</kbd> to {status === 'running' ? 'pause' : 'resume'} • <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">R</kbd> to reset
          </p>
        )}
      </div>

      {/* Cost Benchmarks */}
      {totalCost > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wide">
            Cost Comparison
          </h3>
          
          <div className="space-y-3">
            <BenchmarkBar
              label="Team Lunch"
              value={totalCost}
              max={200}
              color="bg-green-500"
            />
            <BenchmarkBar
              label="Monthly SaaS"
              value={totalCost}
              max={500}
              color="bg-yellow-500"
            />
            <BenchmarkBar
              label="New Laptop"
              value={totalCost}
              max={2000}
              color="bg-orange-500"
            />
            <BenchmarkBar
              label="Work Day Cost"
              value={totalCost}
              max={5000}
              color="bg-red-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function BenchmarkBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="text-slate-900 dark:text-white font-medium">
          ${max.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

