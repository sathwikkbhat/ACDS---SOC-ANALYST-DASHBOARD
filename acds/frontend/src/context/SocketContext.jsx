import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE, WS_BASE } from '../api';
import { generateBatch, generateLiveAlert, computeStats } from '../syntheticEngine';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

// ── Constants ─────────────────────────────────────────────────────────────
// Maximum alerts kept in memory at any time (keeps UI fast)
const MAX_ALERTS = 200;
// Synthetic batch drip: slow & realistic — 3 alerts every 280ms ≈ 10/sec
const BATCH_DRIP_SIZE        = 3;
const BATCH_DRIP_INTERVAL_MS = 280;

export const SocketProvider = ({ children }) => {
  const [alerts, setAlerts]       = useState([]);
  const [stats, setStats]         = useState({ total: 0, critical: 0, high: 0, false_positives: 0, correlated: 0 });
  const [backendOnline, setBackendOnline] = useState(false);

  // Synthetic mode state
  const [syntheticMode, setSyntheticMode]   = useState(false);
  // Loading progress for synthetic data drip (0–100)
  const [syntheticLoading, setSyntheticLoading] = useState(false);

  const syntheticInterval    = useRef(null);  // live alert drip after initial batch
  const batchDripInterval    = useRef(null);  // initial batch drip timer
  const syntheticBatchRef    = useRef([]);    // holds the full pre-generated set
  const batchDripIndexRef    = useRef(0);     // current drip cursor

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
        setBackendOnline(true);
      };
      socket.onmessage = (event) => {
        if (dead) return;
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            setAlerts(prev => {
              const merged = [...data.reverse(), ...prev];
              if (merged.length > MAX_ALERTS) merged.length = MAX_ALERTS;
              return merged;
            });
            window.dispatchEvent(new CustomEvent('acds-warp-batch', { detail: data }));
          } else {
            if (!data.alert_id) return;
            setAlerts(prev => {
              const exists = prev.find(a => a.alert_id === data.alert_id);
              if (exists) return prev;
              const newList = [data, ...prev];
              if (newList.length > MAX_ALERTS) newList.length = MAX_ALERTS;
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

  // ── Synthetic mode: drip alerts in batches so the UI stays smooth ──
  const startSynthetic = useCallback(() => {
    setSyntheticMode(true);
    setSyntheticLoading(true);

    // Pre-generate capped set
    const fullBatch = generateBatch(MAX_ALERTS, 72);
    syntheticBatchRef.current = fullBatch;
    batchDripIndexRef.current = 0;

    // Clear previous state
    setAlerts([]);
    setStats({ total: 0, critical: 0, high: 0, false_positives: 0, correlated: 0 });

    // Drip alerts slowly — BATCH_DRIP_SIZE per tick, feels real not spammy
    batchDripInterval.current = setInterval(() => {
      const idx   = batchDripIndexRef.current;
      const batch = syntheticBatchRef.current;

      if (idx >= batch.length) {
        // Drip complete
        clearInterval(batchDripInterval.current);
        batchDripInterval.current = null;
        setSyntheticLoading(false);

        // Final stats from the full loaded set
        setAlerts(prev => {
          setStats(computeStats(prev));
          return prev;
        });
        return;
      }

      const chunk = batch.slice(idx, idx + BATCH_DRIP_SIZE);
      batchDripIndexRef.current += BATCH_DRIP_SIZE;

      setAlerts(prev => {
        const merged = [...prev, ...chunk];
        merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        if (merged.length > MAX_ALERTS) merged.length = MAX_ALERTS;
        return merged;
      });

      setStats(prev => ({
        ...prev,
        total:           Math.min(batchDripIndexRef.current, batch.length),
        critical:        chunk.filter(a => a.severity === 'Critical').length + (prev.critical || 0),
        high:            chunk.filter(a => a.severity === 'High').length + (prev.high || 0),
        false_positives: chunk.filter(a => a.false_positive).length + (prev.false_positives || 0),
        correlated:      chunk.filter(a => a.correlated).length + (prev.correlated || 0),
      }));
    }, BATCH_DRIP_INTERVAL_MS);

    // After drip completes, start live drip — 1 new alert every 6–10s (calm, believable)
    const dripDuration = Math.ceil(MAX_ALERTS / BATCH_DRIP_SIZE) * BATCH_DRIP_INTERVAL_MS + 500;
    setTimeout(() => {
      const liveInterval = () => {
        const newAlert = generateLiveAlert();
        setAlerts(prev => {
          const newList = [newAlert, ...prev];
          if (newList.length > MAX_ALERTS) newList.length = MAX_ALERTS;
          window.dispatchEvent(new CustomEvent('acds-new-alert', { detail: newAlert }));
          return newList;
        });
        setStats(prev => ({
          ...prev,
          total:           prev.total + 1,
          critical:        newAlert.severity === 'Critical' ? prev.critical + 1 : prev.critical,
          high:            newAlert.severity === 'High'     ? prev.high + 1     : prev.high,
          false_positives: newAlert.false_positive ? prev.false_positives + 1 : prev.false_positives,
          correlated:      newAlert.correlated     ? prev.correlated + 1      : prev.correlated,
        }));

        // Random interval: 6–10 seconds between live alerts
        syntheticInterval.current = setTimeout(liveInterval, 6000 + Math.random() * 4000);
      };
      syntheticInterval.current = setTimeout(liveInterval, 6000 + Math.random() * 4000);
    }, dripDuration);

  }, []);

  const stopSynthetic = useCallback(() => {
    setSyntheticMode(false);
    setSyntheticLoading(false);
    if (syntheticInterval.current) {
      clearTimeout(syntheticInterval.current);
      syntheticInterval.current = null;
    }
    if (batchDripInterval.current) {
      clearInterval(batchDripInterval.current);
      batchDripInterval.current = null;
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
      syntheticLoading,
      startSynthetic,
      stopSynthetic,
    }}>
      {children}
    </SocketContext.Provider>
  );
};
