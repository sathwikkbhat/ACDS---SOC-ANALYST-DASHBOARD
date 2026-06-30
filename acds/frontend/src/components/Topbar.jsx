import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function Topbar() {
  const { backendOnline, syntheticMode, syntheticLoading } = useSocket();
  const navigate = useNavigate();
  const [time, setTime] = useState('');

  // Live clock — ticks every second
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 'Z'
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Derive feed status from actual state
  const feedStatus = syntheticLoading
    ? { label: 'LOADING SYNTHETIC', color: '#A84B2B', pulse: true }
    : syntheticMode
    ? { label: 'SYNTHETIC FEED', color: '#A84B2B', pulse: true }
    : backendOnline
    ? { label: 'LIVE FEED ACTIVE', color: '#5B8059', pulse: true }
    : { label: 'SYSTEM STANDBY', color: '#6B6560', pulse: false };

  return (
    <header className="h-20 bg-[#0A0C0E]/60 backdrop-blur-xl flex justify-between items-center px-8 z-40 shrink-0 border-b border-[#6B6560]/10 relative z-50">
      <div className="flex items-center gap-6">
        <h2 className="font-['Space_Grotesk'] font-bold text-lg uppercase text-[#A84B2B]">
          ACDS — AI Cyber Defense System
        </h2>
        <div className="h-4 w-px bg-[#A84B2B]/10" />

        {/* Dynamic feed indicator */}
        <div className="flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs" style={{ color: feedStatus.color }}>
          <span className="relative flex h-2 w-2">
            {feedStatus.pulse && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: feedStatus.color }} />
            )}
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: feedStatus.color }} />
          </span>
          {feedStatus.label}
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Live clock */}
        <span className="font-['IBM_Plex_Mono'] text-xs text-[#6B6560] tracking-widest tabular-nums">
          {time}
        </span>

        <div className="h-4 w-px bg-[#6B6560]/20" />

        {/* Backend connectivity indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full transition-colors duration-500"
            style={{ background: backendOnline ? '#5B8059' : '#6B6560' }}
          />
          <span className="font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-widest text-[#6B6560]">
            {backendOnline ? 'API ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <div className="h-4 w-px bg-[#6B6560]/20" />

        {/* LOGS button — navigates to Archives */}
        <button
          onClick={() => navigate('/archives')}
          className="px-4 py-2 border border-[#6B6560]/30 text-[#E8E2D9] font-['Space_Grotesk'] font-bold text-sm uppercase hover:bg-[#A84B2B]/10 hover:border-[#A84B2B]/40 hover:text-[#A84B2B] transition-all cursor-pointer"
        >
          LOGS
        </button>

        <span className="material-symbols-outlined text-[#A84B2B]" style={{ verticalAlign: 'middle' }}>
          signal_cellular_alt
        </span>
      </div>
    </header>
  );
}
