import { createContext, useContext, useState, type ReactNode } from 'react';
import { sampleCameras, sampleZones, sampleAlerts, type Camera, type Zone, type SafetyAlert } from '@/lib/monitoring-api';
function useCommandState() {
  const [cameras, setCameras] = useState<Camera[]>(sampleCameras);
  const [zones, setZones] = useState<Zone[]>(sampleZones);
  const [alerts, setAlerts] = useState<SafetyAlert[]>(sampleAlerts);
  const [monitoring, setMonitoring] = useState<'Running' | 'Paused' | 'Stopped'>('Running');
  const [selectedCamera, setSelectedCamera] = useState('CAM-001');
  const [notice, setNotice] = useState('');
  const notify = (message: string) => { setNotice(message); setTimeout(() => setNotice(''), 4500); };
  const updateAlert = (id: string, status: SafetyAlert['status']) => {
    setAlerts(previous => previous.map(a => a.id === id ? { ...a, status, history: [...a.history, `${new Date().toLocaleTimeString()} — ${status} by operator (demo)`] } : a));
    notify(`Alert ${id} ${status.toLowerCase()} in this demo session.`);
  };
  return { cameras, setCameras, zones, setZones, alerts, updateAlert, monitoring, setMonitoring, selectedCamera, setSelectedCamera, notice, notify };
}
const CommandContext = createContext<ReturnType<typeof useCommandState> | null>(null);
export function CommandProvider({ children }: { children: ReactNode }) { const state = useCommandState(); return <CommandContext.Provider value={state}>{children}</CommandContext.Provider>; }
export function useCommand() { const context = useContext(CommandContext); if (!context) throw new Error('CommandProvider required'); return context; }
