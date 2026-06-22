import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE, WS_BASE } from '../api';
import { generateBatch, generateLiveAlert, computeStats } from '../syntheticEngine';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [alerts, setAlerts]       = useState([]);
  const [stats, setStats]         = useState({ total: 0, critical: 0, high: 0, false_positives: 0, correlated: 0 });
  const [backendOnline, setBackendOnline] = useState(false);

  // Synthetic mode state
  const [syntheticMode, setSyntheticMode]   = useState(false);
  const syntheticInterval = useRef(null);

  // ── Try to connect to backend once; mark online/offline ───────────
  useEffect(() => {
    let socket;
    let dead = false;

    const tryBackend = async () => {
      try {
        const res = await axios.get(`${API_BASE}/stats`, { timeout: 3000 });
        setStats(res.data);
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    };

    tryBackend();

    try {
      socket = new WebSocket(`${WS_BASE}/ws/alerts`);
      socket.onopen = () => {
        console.log('WebSocket Connected');
        setBackendOnline(true);
      };
      socket.onmessage = (event) => {
        if (dead) return;
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            setAlerts(prev => {
              const newList = [...data.reverse(), ...prev];
              if (newList.length > 5000) newList.length = 5000;
              return newList;
            });
            window.dispatchEvent(new CustomEvent('acds-warp-batch', { detail: data }));
          } else {
            if (!data.alert_id) return;
            setAlerts(prev => {
              const exists = prev.find(a => a.alert_id === data.alert_id);
              if (exists) return prev;
              const newList = [data, ...prev];
              if (newList.length > 5000) newList.length = 5000;
              window.dispatchEvent(new CustomEvent('acds-new-alert', { detail: data }));
              return newList;
            });
          }
        } catch (e) { console.error(e); }
      };
      socket.onerror = () => setBackendOnline(false);
    } catch (err) {
      console.warn('WebSocket unavailable:', err.message);
      setBackendOnline(false);
    }

    return () => {
      dead = true;
      if (socket) { try { socket.close(); } catch (_) {} }
    };
  }, []);

  // ── Periodic stats refresh when backend is online ─────────────────
  useEffect(() => {
    if (!backendOnline || syntheticMode) return;
    const id = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/stats`);
        setStats(res.data);
      } catch { setBackendOnline(false); }
    }, 3000);
    return () => clearInterval(id);
  }, [backendOnline, syntheticMode]);

  // ── Synthetic mode: generate 5000 alerts + stream new ones ────────
  const startSynthetic = useCallback(() => {
    setSyntheticMode(true);
    const batch = generateBatch(5000);
    setAlerts(batch);
    setStats(computeStats(batch));

    // Stream ~1 new alert per second for live feel
    syntheticInterval.current = setInterval(() => {
      const newAlert = generateLiveAlert();
      setAlerts(prev => {
        const newList = [newAlert, ...prev];
        if (newList.length > 5000) newList.length = 5000;
        window.dispatchEvent(new CustomEvent('acds-new-alert', { detail: newAlert }));
        return newList;
      });
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        critical: newAlert.severity === 'Critical' ? prev.critical + 1 : prev.critical,
        high: newAlert.severity === 'High' ? prev.high + 1 : prev.high,
        false_positives: newAlert.false_positive ? prev.false_positives + 1 : prev.false_positives,
        correlated: newAlert.correlated ? prev.correlated + 1 : prev.correlated,
      }));
    }, 1000);
  }, []);

  const stopSynthetic = useCallback(() => {
    setSyntheticMode(false);
    if (syntheticInterval.current) {
      clearInterval(syntheticInterval.current);
      syntheticInterval.current = null;
    }
  }, []);

  // ── System reset ──────────────────────────────────────────────────
  const resetSystem = useCallback(async () => {
    stopSynthetic();
    setAlerts([]);
    setStats({ total: 0, critical: 0, high: 0, false_positives: 0, correlated: 0 });
    window.dispatchEvent(new CustomEvent('acds-reset'));
    if (backendOnline) {
      try { await axios.post(`${API_BASE}/reset`); } catch (_) {}
    }
  }, [backendOnline, stopSynthetic]);

  return (
    <SocketContext.Provider value={{
      alerts,
      stats,
      resetSystem,
      backendOnline,
      syntheticMode,
      startSynthetic,
      stopSynthetic,
    }}>
      {children}
    </SocketContext.Provider>
  );
};
