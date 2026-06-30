import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-[#0A0C0E] overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <div className="flex-1 overflow-y-auto relative z-10">
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
