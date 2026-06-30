import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import Blueprints from './pages/Blueprints';
import Threats from './pages/Threats';
import Intelligence from './pages/Intelligence';
import Archives from './pages/Archives';
import Settings from './pages/Settings';

// Animated page wrapper — mounts with a fade + slight upward slide
function AnimatedPage({ children }) {
  const location = useLocation();
  return (
    <div
      key={location.pathname}
      style={{
        animation: 'pageEnter 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
        minHeight: '100%',
      }}
    >
      {children}
    </div>
  );
}

function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0A0C0E]/90 border-t border-[#1a1a1a] flex justify-around items-center z-50 backdrop-blur-xl">
      <NavLink
        to="/blueprints"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-tighter transition-colors ${
            isActive ? 'text-[#A84B2B]' : 'text-[#6B6560] hover:text-[#A84B2B]'
          }`
        }
      >
        <span className="material-symbols-outlined text-lg">architecture</span>
        BLUEPRINTS
      </NavLink>
      <NavLink
        to="/threats"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-tighter transition-colors ${
            isActive ? 'text-[#A84B2B]' : 'text-[#6B6560] hover:text-[#A84B2B]'
          }`
        }
      >
        <span className="material-symbols-outlined text-lg">security</span>
        THREATS
      </NavLink>
      <NavLink
        to="/intelligence"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-tighter transition-colors ${
            isActive ? 'text-[#A84B2B]' : 'text-[#6B6560] hover:text-[#A84B2B]'
          }`
        }
      >
        <span className="material-symbols-outlined text-lg">psychology</span>
        INTEL
      </NavLink>
      <NavLink
        to="/archives"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-tighter transition-colors ${
            isActive ? 'text-[#A84B2B]' : 'text-[#6B6560] hover:text-[#A84B2B]'
          }`
        }
      >
        <span className="material-symbols-outlined text-lg">inventory_2</span>
        ARCHIVES
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-tighter transition-colors ${
            isActive ? 'text-[#A84B2B]' : 'text-[#6B6560] hover:text-[#A84B2B]'
          }`
        }
      >
        <span className="material-symbols-outlined text-lg">settings</span>
        SETTINGS
      </NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-[#0A0C0E] overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <div className="flex-1 overflow-y-auto relative z-10 pb-16 md:pb-0">
              <Routes>
                <Route path="/" element={<Navigate to="/blueprints" replace />} />
                <Route path="/blueprints" element={<AnimatedPage><Blueprints /></AnimatedPage>} />
                <Route path="/threats" element={<AnimatedPage><Threats /></AnimatedPage>} />
                <Route path="/intelligence" element={<AnimatedPage><Intelligence /></AnimatedPage>} />
                <Route path="/archives" element={<AnimatedPage><Archives /></AnimatedPage>} />
                <Route path="/settings" element={<AnimatedPage><Settings /></AnimatedPage>} />
              </Routes>
            </div>
          </div>
          <MobileNav />
        </div>

        {/* Page transition keyframe */}
        <style>{`
          @keyframes pageEnter {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </BrowserRouter>
    </SocketProvider>
  );
}
