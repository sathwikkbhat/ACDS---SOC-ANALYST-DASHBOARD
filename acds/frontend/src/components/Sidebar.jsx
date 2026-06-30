import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function Sidebar() {
  const { alerts, stats } = useSocket();

  // Compute live health from stats
  const healthPct = stats?.total > 0
    ? Math.max(5, Math.round(100 - (stats.critical / Math.max(stats.total, 1)) * 60))
    : 100;
  const healthColor = healthPct >= 90 ? '#A84B2B' : healthPct >= 70 ? '#fbbf24' : '#ef4444';

  const criticalCount = stats?.critical ?? 0;
  const alertCount = alerts?.length ?? 0;

  const navClass = (isActive) =>
    `flex items-center px-6 py-4 font-['IBM_Plex_Mono'] uppercase tracking-tighter text-xs transition-colors duration-[40ms] ${
      isActive
        ? 'text-[#E8E2D9] bg-[#1e110d] border-l-2 border-[#A84B2B]'
        : 'text-[#6B6560] hover:text-[#A84B2B] hover:bg-[#120b0a]'
    }`;

  return (
    <aside className="w-64 bg-[#0A0C0E] flex flex-col py-8 z-50 h-screen shrink-0 border-r border-[#1a1a1a]">
      {/* Logo Area */}
      <div className="px-6 mb-12">
        <div className="flex items-center gap-3 mb-1">
          {/* Shield SVG Icon */}
          <svg width="28" height="32" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14 1L2 6V16C2 22.627 7.373 28.627 14 31C20.627 28.627 26 22.627 26 16V6L14 1Z"
              fill="#A84B2B"
              fillOpacity="0.12"
              stroke="#A84B2B"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Inner scan line */}
            <line x1="6" y1="16" x2="22" y2="16" stroke="#A84B2B" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
            <circle cx="14" cy="16" r="3" fill="#A84B2B" fillOpacity="0.8">
              <animate attributeName="r" values="3;4.5;3" dur="2s" repeatCount="indefinite" />
              <animate attributeName="fillOpacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
          <h1 className="font-['Space_Grotesk'] font-black text-[#A84B2B] tracking-widest text-xl">ACDS</h1>
        </div>
        <p className="font-['IBM_Plex_Mono'] uppercase tracking-tighter text-[9px] text-[#6B6560] mt-1 pl-[40px]">
          v4.1.0 · AI CYBER DEFENSE
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        <NavLink to="/blueprints" className={({ isActive }) => navClass(isActive)}>
          <span className="material-symbols-outlined mr-4" style={{ verticalAlign: 'middle' }}>architecture</span>
          BLUEPRINTS
        </NavLink>

        <NavLink to="/threats" className={({ isActive }) => navClass(isActive)}>
          <span className="material-symbols-outlined mr-4" style={{ verticalAlign: 'middle' }}>security</span>
          THREATS
          {alertCount > 0 && (
            <span
              className="ml-auto font-['IBM_Plex_Mono'] text-[8px] font-black px-1.5 py-0.5 rounded-sm"
              style={{
                background: criticalCount > 0 ? 'rgba(168,75,43,0.2)' : 'rgba(107,101,96,0.2)',
                color: criticalCount > 0 ? '#ffb4ab' : '#6B6560',
                border: `1px solid ${criticalCount > 0 ? 'rgba(168,75,43,0.4)' : 'rgba(107,101,96,0.3)'}`,
              }}
            >
              {alertCount > 99 ? '99+' : alertCount}
            </span>
          )}
        </NavLink>

        <NavLink to="/intelligence" className={({ isActive }) => navClass(isActive)}>
          <span className="material-symbols-outlined mr-4" style={{ verticalAlign: 'middle' }}>psychology</span>
          INTELLIGENCE
        </NavLink>

        <NavLink to="/archives" className={({ isActive }) => navClass(isActive)}>
          <span className="material-symbols-outlined mr-4" style={{ verticalAlign: 'middle' }}>inventory_2</span>
          ARCHIVES
        </NavLink>
      </nav>

      <div className="mt-auto px-6 space-y-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center py-4 font-['IBM_Plex_Mono'] uppercase tracking-tighter text-xs transition-colors duration-[40ms] ${
              isActive ? 'text-[#E8E2D9]' : 'text-[#6B6560] hover:text-[#A84B2B]'
            }`
          }
        >
          <span className="material-symbols-outlined mr-4" style={{ verticalAlign: 'middle' }}>settings</span>
          SETTINGS
        </NavLink>

        {/* Live System Health */}
        <div className="bg-[#080808] p-4 border border-[#6B6560]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-['IBM_Plex_Mono'] text-[#6B6560]">SYSTEM HEALTH</span>
            <span
              className="text-[10px] font-['IBM_Plex_Mono'] font-bold transition-colors duration-1000"
              style={{ color: healthColor }}
            >
              {healthPct}%
            </span>
          </div>
          <div className="h-1 bg-[#0A0C0E] w-full overflow-hidden">
            <div
              className="h-1 transition-all duration-1000 ease-out"
              style={{ width: `${healthPct}%`, background: healthColor }}
            />
          </div>
          {criticalCount > 0 && (
            <p className="font-['IBM_Plex_Mono'] text-[8px] text-[#ffb4ab] mt-2 uppercase tracking-widest animate-pulse">
              ⚠ {criticalCount} CRITICAL ACTIVE
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
