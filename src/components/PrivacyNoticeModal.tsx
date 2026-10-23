'use strict';
'use client';

import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, X } from 'lucide-react';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyNoticeModal({ isOpen, onClose }: PrivacyNoticeModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-teal-500/20 shadow-2xl p-6 sm:p-8 text-slate-200">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 id="privacy-modal-title" className="text-lg font-bold text-white">
              Privacy & Security Architecture
            </h2>
            <p className="text-xs text-slate-400">
              PaisaPilot AI Transparency & Data Protection Notice
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <Lock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-0.5">No Bank Credentials or UPI PINs</h3>
              <p className="text-xs text-slate-400">
                PaisaPilot AI never asks for bank passwords, UPI PINs, OTPs, or credit card numbers. We do not claim live bank connectivity or automated account scraping.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <EyeOff className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-0.5">Minimal AI Data Transfer</h3>
              <p className="text-xs text-slate-400">
                Only anonymized numerical aggregates (e.g. total food spend, burn rate, days until payday) are passed to the Gemini AI reasoning model. Merchant names and transaction notes are sanitized and treated as untrusted data.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <Server className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-0.5">Local-First & Ephemeral Processing</h3>
              <p className="text-xs text-slate-400">
                Your financial profile and transactions are saved locally in your browser session. CSV uploads are processed securely with strict size and row limits, without persisting raw financial databases.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
