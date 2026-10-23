'use strict';
'use client';

import React from 'react';
import { Sparkles, Shield, Download, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenPrivacy: () => void;
  onOpenExport: () => void;
  onLoadDemo: () => void;
  onReset: () => void;
  isDemoActive: boolean;
  daysUntilPayday: number;
}

export function Header({
  onOpenPrivacy,
  onOpenExport,
  onLoadDemo,
  onReset,
  isDemoActive,
  daysUntilPayday,
}: HeaderProps) {
  return (
    <header className="border-b border-teal-500/15 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                PaisaPilot<span className="text-teal-400">.ai</span>
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                Predictive Copilot
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI-driven cashflow runway & daily allowance guardian
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Payday pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Payday in <strong className="text-white">{daysUntilPayday} days</strong></span>
          </div>

          {/* Demo toggle */}
          <button
            onClick={isDemoActive ? onReset : onLoadDemo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isDemoActive
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle realistic Bengaluru tech-salary spending scenario"
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>{isDemoActive ? 'Demo Loaded' : 'Load Demo'}</span>
          </button>

          {/* Export button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Download audit report in CSV or JSON format"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export Audit</span>
          </button>

          {/* Privacy button */}
          <button
            onClick={onOpenPrivacy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="View privacy disclosure and security safeguards"
          >
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Privacy Notice</span>
          </button>
        </div>
      </div>
    </header>
  );
}
