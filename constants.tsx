
import React from 'react';

export const COLORS = {
  bg: '#0a0b14',
  card: '#111422',
  accent: '#8b5cf6', // Purple
  border: '#1e293b',
  text: '#e2e8f0',
  secondary: '#94a3b8',
  obligation: '#f97316', // Orange
  social: '#3b82f6', // Blue
  admin: '#eab308', // Yellow
  personal: '#22c55e', // Green
  logistics: '#a855f7', // Purple
};

export const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
    <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M50 10 L90 50 L50 90 L10 50 Z" className="text-purple-500" />
      <circle cx="50" cy="10" r="4" fill="currentColor" className="text-purple-400" />
      <circle cx="90" cy="50" r="4" fill="currentColor" className="text-purple-400" />
      <circle cx="50" cy="90" r="4" fill="currentColor" className="text-purple-400" />
      <circle cx="10" cy="50" r="4" fill="currentColor" className="text-purple-400" />
      <text x="50" y="60" textAnchor="middle" fontSize="30" fontWeight="bold" className="fill-white font-tech">W</text>
    </svg>
  </div>
);
