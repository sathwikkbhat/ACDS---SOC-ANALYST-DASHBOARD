import React, { useState, useEffect, useRef } from 'react';
import { API_BASE as API } from '../api';

// Default values for the reset button
const DEFAULTS = {
  brute_force_threshold: 5,
  brute_force_window_sec: 60,
  beacon_interval_variance: 0.1,
  exfil_threshold_bytes: 1048576,
  correlation_window_sec: 300,
  gemini_rate_limit_sec: 10,
};

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-8 right-8 z-[200] px-6 py-3 font-['IBM_Plex_Mono'] text-xs font-bold uppercase tracking-widest border shadow-xl backdrop-blur-md transition-all duration-300 ${
        toast.type === 'success'
          ? 'bg-[#2f4d2f]/90 text-[#A84B2B] border-[#A84B2B]'
          : toast.type === 'error'
          ? 'bg-[#93000a]/90 text-[#ffb4ab] border-[#ffb4ab]'
          : 'bg-[#0A0C0E]/90 text-[#e5e2e1] border-[#6B6560]'
      }`}
    >
      {toast.message}
    </div>
  );
}

export default function Settings() {
  const [whitelist, setWhitelist] = useState([]);
  const [settings, setSettings] = useState(null);
  const [toast, setToast] = useState(null);
  const [newIpInput, setNewIpInput] = useState('');
  const [showIpInput, setShowIpInput] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const formRefs = {
    bf_thresh: useRef(null),
    bf_win: useRef(null),
    bc_var: useRef(null),
    ex_thresh: useRef(null),
    cor_win: useRef(null),
    gem_rate: useRef(null),
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  useEffect(() => {
    fetch(`${API}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.admin_whitelist) setWhitelist(data.admin_whitelist);
        setSettings(data);
      })
      .catch(() => {
        showToast('Using local configuration (Offline Mode)', 'info');
        setWhitelist(['192.168.1.10', '10.0.0.45']);
        setSettings({
          ...DEFAULTS,
          input_mode: 'simulate',
          sample_log_file: 'synthetic_stream',
          gemini_api_key_set: false,
        });
      });
  }, []);

  const addIp = async () => {
    const ip = newIpInput.trim();
    if (!ip) return;
    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^[\w.-]+$/;
    if (!ipRegex.test(ip)) {
      showToast('Invalid IP address format', 'error');
      return;
    }
    try {
      const res = await fetch(`${API}/settings/whitelist/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });
      const data = await res.json();
      if (data.whitelist) {
        setWhitelist(data.whitelist);
        setNewIpInput('');
        setShowIpInput(false);
        showToast(`✓ ${ip} added to whitelist`, 'success');
      }
    } catch (e) {
      showToast('Failed to add IP — backend offline?', 'error');
    }
  };

  const removeIp = async (ip) => {
    try {
      const res = await fetch(`${API}/settings/whitelist/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });
      const data = await res.json();
      if (data.whitelist) {
        setWhitelist(data.whitelist);
        showToast(`✓ ${ip} removed from whitelist`, 'success');
      }
    } catch (e) {
      showToast('Failed to remove IP', 'error');
    }
  };

  const resetDefaults = () => {
    if (formRefs.bf_thresh.current)  formRefs.bf_thresh.current.value  = DEFAULTS.brute_force_threshold;
    if (formRefs.bf_win.current)     formRefs.bf_win.current.value     = DEFAULTS.brute_force_window_sec;
    if (formRefs.bc_var.current)     formRefs.bc_var.current.value     = DEFAULTS.beacon_interval_variance;
    if (formRefs.ex_thresh.current)  formRefs.ex_thresh.current.value  = DEFAULTS.exfil_threshold_bytes;
    if (formRefs.cor_win.current)    formRefs.cor_win.current.value    = DEFAULTS.correlation_window_sec;
    if (formRefs.gem_rate.current)   formRefs.gem_rate.current.value   = DEFAULTS.gemini_rate_limit_sec;
    showToast('Fields reset to factory defaults', 'info');
  };

  const saveChanges = async () => {
    const payload = {
      brute_force_threshold:   parseInt(formRefs.bf_thresh.current?.value),
      brute_force_window_sec:  parseInt(formRefs.bf_win.current?.value),
      beacon_interval_variance: parseFloat(formRefs.bc_var.current?.value),
      exfil_threshold_bytes:   parseInt(formRefs.ex_thresh.current?.value),
      correlation_window_sec:  parseInt(formRefs.cor_win.current?.value),
      gemini_rate_limit_sec:   parseInt(formRefs.gem_rate.current?.value),
    };
    try {
      const res = await fetch(`${API}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) showToast('✓ Settings saved to backend', 'success');
      else showToast('Backend rejected settings', 'error');
    } catch (e) {
      showToast('Failed to save — backend offline?', 'error');
    }
  };

  if (!settings) return (
    <div className="flex items-center justify-center h-screen bg-[#0A0C0E]">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-[#A84B2B] text-4xl animate-spin">sync</span>
        <p className="font-['IBM_Plex_Mono'] text-[#6B6560] text-xs uppercase tracking-widest">Loading config...</p>
      </div>
    </div>
  );

  return (
    <div className="pt-8 pb-16 px-8 min-h-screen bg-[#0A0C0E] relative overflow-y-auto">
      <Toast toast={toast} />

      {/* Background Watermark */}
      <div className="absolute top-1/4 left-1/4 opacity-[0.02] pointer-events-none select-none">
        <span className="font-['Space_Grotesk'] font-black text-[20rem] leading-none text-[#e5e2e1]">ACDS</span>
      </div>

      {/* Page Header */}
      <div className="flex items-baseline justify-between mb-10 mt-8 relative z-10">
        <div>
          <h2 className="font-['Space_Grotesk'] text-5xl font-black tracking-tight text-[#e5e2e1] mb-2">Settings</h2>
          <div className="flex items-center gap-3">
            <span className="font-['IBM_Plex_Mono'] text-xs text-[#5B8059] py-1 px-2 bg-[#A84B2B]/5 border border-[#A84B2B]/10">config.py</span>
            <span className="h-[1px] w-12 bg-[#6B6560]/30" />
            <p className="font-['IBM_Plex_Mono'] text-[10px] text-[#b9ccb2] tracking-widest uppercase">System Core Configuration</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetDefaults}
            className="px-6 py-2 bg-[#0A0C0E] border border-[#6B6560]/20 font-['IBM_Plex_Mono'] text-[10px] tracking-tighter text-[#e5e2e1] hover:bg-[#120b0a] hover:border-[#6B6560]/40 transition-colors uppercase"
          >
            RESET_DEFAULTS
          </button>
          <button
            onClick={saveChanges}
            className="px-6 py-2 bg-[#A84B2B] text-[#1a2b1a] font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-tighter hover:bg-[#c55c38] transition-all uppercase"
          >
            SAVE_CHANGES
          </button>
        </div>
      </div>

      {/* Settings Bento Grid */}
      <div className="grid grid-cols-12 gap-6 relative z-10 mb-20 text-[#e5e2e1]">

        {/* Section 01: Detection Thresholds */}
        <section className="col-span-12 lg:col-span-8 bg-[#0A0C0E] p-8 border border-[#6B6560]/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-['Space_Grotesk'] text-xl font-bold tracking-tight flex items-center gap-3 text-[#e5e2e1]">
              <span className="w-1.5 h-6 bg-[#A84B2B]" />
              SECTION_01 <span className="text-[#b9ccb2] font-medium">Detection Thresholds</span>
            </h3>
            <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#6B6560]">v4.0.2-ALPHA</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {[
              { label: 'BRUTE_FORCE_THRESHOLD',   ref: formRefs.bf_thresh,  defaultVal: settings.brute_force_threshold,   type: 'number', unit: 'attempts' },
              { label: 'BRUTE_FORCE_WINDOW_SEC',   ref: formRefs.bf_win,     defaultVal: settings.brute_force_window_sec,  type: 'number', unit: 'seconds'  },
              { label: 'BEACON_INTERVAL_VARIANCE', ref: formRefs.bc_var,     defaultVal: settings.beacon_interval_variance, type: 'text',  unit: 'float'    },
              { label: 'EXFIL_THRESHOLD_BYTES',    ref: formRefs.ex_thresh,  defaultVal: settings.exfil_threshold_bytes,   type: 'number', unit: 'bytes'    },
              { label: 'CORRELATION_WINDOW_SEC',   ref: formRefs.cor_win,    defaultVal: settings.correlation_window_sec,  type: 'number', unit: 'seconds'  },
              { label: 'GEMINI_RATE_LIMIT_SEC',    ref: formRefs.gem_rate,   defaultVal: settings.gemini_rate_limit_sec,   type: 'number', unit: 'requests' },
            ].map(field => (
              <div key={field.label} className="space-y-2">
                <label className="block font-['IBM_Plex_Mono'] text-[10px] text-[#b9ccb2] tracking-widest uppercase">{field.label}</label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 w-1 h-full bg-[#A84B2B] scale-y-0 group-focus-within:scale-y-100 transition-transform" />
                  <input
                    ref={field.ref}
                    className="w-full bg-[#080808] border-none py-3 px-4 font-['IBM_Plex_Mono'] text-[#A84B2B] focus:ring-0 outline-none pr-20"
                    type={field.type}
                    defaultValue={field.defaultVal}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-['IBM_Plex_Mono'] text-[#6B6560]/50 uppercase">{field.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 03: API & Input Mode */}
        <section className="col-span-12 lg:col-span-4 bg-[#0A0C0E] p-8 border border-[#6B6560]/10 flex flex-col">
          <div className="mb-8">
            <h3 className="font-['Space_Grotesk'] text-xl font-bold tracking-tight flex items-center gap-3 text-[#e5e2e1]">
              <span className="w-1.5 h-6 bg-[#A84B2B]" />
              SECTION_03 <span className="text-[#b9ccb2] font-medium">API &amp; Mode</span>
            </h3>
          </div>
          <div className="space-y-2">
            <label className="block font-['IBM_Plex_Mono'] text-[10px] text-[#b9ccb2] tracking-widest uppercase">GEMINI_API_KEY</label>
            <div className="relative group">
              <div className={`w-full bg-[#080808] border-none py-3 px-4 font-['IBM_Plex_Mono'] text-sm flex items-center gap-2 ${
                settings?.gemini_api_key_set ? 'text-[#5B8059]' : 'text-[#6B6560]'
              }`}>
                {settings?.gemini_api_key_set ? (
                  <>
                    <span className="material-symbols-outlined text-sm" style={{ verticalAlign: 'middle' }}>check_circle</span>
                    <span className="tracking-widest">API KEY CONFIGURED</span>
                    <span className="ml-2 font-['IBM_Plex_Mono'] text-[10px] text-[#6B6560] tracking-widest">({showApiKey ? 'AIza••••••••••••••••••••••' : '••••••••••••••••••••••••••'})</span>
                    <button
                      onClick={() => setShowApiKey(v => !v)}
                      className="ml-auto text-[#6B6560] hover:text-[#A84B2B] transition-colors"
                    >
                      <span className="material-symbols-outlined text-base" style={{ verticalAlign: 'middle' }}>
                        {showApiKey ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm" style={{ verticalAlign: 'middle' }}>warning</span>
                    <span className="tracking-widest">NOT CONFIGURED</span>
                  </>
                )}
              </div>
            </div>
            <p className="font-['IBM_Plex_Mono'] text-[10px] text-[#6B6560]/60 mt-2">Set via GEMINI_API_KEY in backend <code>.env</code>. Used for AI Playbook generation on Critical threats.</p>
          </div>
        </section>

        {/* Section 02: Admin Whitelist */}
        <section className="col-span-12 lg:col-span-8 bg-[#0A0C0E] p-8 border border-[#6B6560]/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-['Space_Grotesk'] text-xl font-bold tracking-tight flex items-center gap-3 text-[#e5e2e1]">
              <span className="w-1.5 h-6 bg-[#A84B2B]" />
              SECTION_02 <span className="text-[#b9ccb2] font-medium">Admin Whitelist</span>
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#120b0a] border border-[#6B6560]/10">
              <span className="material-symbols-outlined text-xs text-[#A84B2B]" style={{ verticalAlign: 'middle' }}>verified_user</span>
              <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#b9ccb2] uppercase">
                {whitelist.length} whitelisted hosts active
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {whitelist.map((ip) => (
                <div key={ip} className="bg-[#080808] border border-[#A84B2B]/20 px-4 py-2 flex items-center gap-4 group">
                  <span className="font-['IBM_Plex_Mono'] text-sm text-[#A84B2B]">{ip}</span>
                  <button
                    onClick={() => removeIp(ip)}
                    className="text-[#6B6560] hover:text-[#ffb4ab] transition-colors"
                    title="Remove IP"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ verticalAlign: 'middle' }}>close</span>
                  </button>
                </div>
              ))}

              {/* Inline add IP input */}
              {showIpInput ? (
                <div className="flex items-center gap-2 bg-[#080808] border border-[#A84B2B]/30 px-3 py-1.5">
                  <input
                    autoFocus
                    value={newIpInput}
                    onChange={e => setNewIpInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') addIp();
                      if (e.key === 'Escape') { setShowIpInput(false); setNewIpInput(''); }
                    }}
                    placeholder="e.g. 192.168.1.100"
                    className="bg-transparent outline-none font-['IBM_Plex_Mono'] text-[11px] text-[#A84B2B] placeholder-[#6B6560]/50 w-40"
                  />
                  <button
                    onClick={addIp}
                    className="font-['IBM_Plex_Mono'] text-[9px] uppercase text-[#5B8059] hover:text-[#A84B2B] transition-colors"
                  >
                    ADD
                  </button>
                  <button
                    onClick={() => { setShowIpInput(false); setNewIpInput(''); }}
                    className="text-[#6B6560] hover:text-[#ffb4ab] transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ verticalAlign: 'middle' }}>close</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowIpInput(true)}
                  className="bg-[#120b0a] border border-[#6B6560]/20 px-4 py-2 font-['IBM_Plex_Mono'] text-[10px] tracking-widest uppercase text-[#e5e2e1] hover:bg-[#A84B2B] hover:text-black transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm" style={{ verticalAlign: 'middle' }}>add</span>
                  ADD IP ADDRESS
                </button>
              )}
            </div>
            <p className="font-['Inter'] text-[10px] text-[#6B6560]/60 mt-4 italic leading-relaxed">
              Note: Whitelisted hosts are exempt from behavioral analysis and threshold-based locking. Use with extreme caution as this bypasses the ACDS neural engine filters.
            </p>
          </div>
        </section>

        {/* Critical Notice Section */}
        <section className="col-span-12 lg:col-span-4 bg-[#93000a]/10 border border-[#ffb4ab]/20 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-7xl text-[#ffb4ab]" style={{ verticalAlign: 'middle' }}>warning</span>
          </div>
          <h3 className="font-['Space_Grotesk'] text-xl font-black text-[#ffb4ab] mb-4 flex items-center gap-3 uppercase italic">
            Critical Notice
          </h3>
          <div className="space-y-4 relative z-10 text-[#e5e2e1]">
            <p className="font-['IBM_Plex_Mono'] text-xs leading-relaxed">
              Unauthorized modification of threshold values may lead to false negatives or system instability.
            </p>
            <div className="h-[1px] w-full bg-[#ffb4ab]/20" />
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#ffb4ab] text-sm mt-0.5" style={{ verticalAlign: 'middle' }}>chevron_right</span>
                <span className="font-['Inter'] text-[10px] uppercase tracking-wider text-[#ffb4ab]/80 font-bold">Log all changes to ACDS_SEC_AUDIT</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#ffb4ab] text-sm mt-0.5" style={{ verticalAlign: 'middle' }}>chevron_right</span>
                <span className="font-['Inter'] text-[10px] uppercase tracking-wider text-[#ffb4ab]/80 font-bold">Require Level 4 Clearance for Exfil resets</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
