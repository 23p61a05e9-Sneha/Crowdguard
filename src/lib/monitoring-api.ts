export type Camera = { id: string; name: string; sourceType: 'Webcam' | 'Video' | 'CCTV / RTSP'; location: string; source: string; status: 'Online' | 'Standby' };
export type Zone = { id: string; name: string; people: number; capacity: number; warning: number; critical: number; enabled: boolean };
export type SafetyAlert = { id: string; severity: 'Critical' | 'Warning'; zone: string; people: number; capacity: number; occupancy: number; time: string; status: 'Active' | 'Acknowledged' | 'Resolved'; history: string[] };
export const sampleCameras: Camera[] = [
  { id: 'CAM-001', name: 'Testing Webcam', sourceType: 'Webcam', location: 'Central Station · Main concourse', source: '0', status: 'Online' },
  { id: 'CAM-002', name: 'Future CCTV Camera 1', sourceType: 'CCTV / RTSP', location: 'Central Station · East entrance', source: '', status: 'Standby' },
  { id: 'CAM-003', name: 'Future CCTV Camera 2', sourceType: 'CCTV / RTSP', location: 'Central Station · Platform access', source: '', status: 'Standby' },
];
export const sampleZones: Zone[] = [
  { id: 'A', name: 'Zone A', people: 5, capacity: 20, warning: 80, critical: 100, enabled: true },
  { id: 'B', name: 'Zone B', people: 12, capacity: 15, warning: 80, critical: 100, enabled: true },
  { id: 'C', name: 'Zone C', people: 16, capacity: 10, warning: 80, critical: 100, enabled: true },
];
export const sampleAlerts: SafetyAlert[] = [
  { id: 'ALT-1042', severity: 'Critical', zone: 'Zone C', people: 16, capacity: 10, occupancy: 160, time: '14:42:08', status: 'Active', history: ['14:42:08 — Occupancy threshold exceeded', '14:42:16 — Capacity exceeded for 8 seconds'] },
  { id: 'ALT-1041', severity: 'Warning', zone: 'Zone B', people: 12, capacity: 15, occupancy: 80, time: '14:38:24', status: 'Active', history: ['14:38:24 — Warning threshold reached'] },
  { id: 'ALT-1040', severity: 'Warning', zone: 'Zone B', people: 13, capacity: 15, occupancy: 87, time: '14:24:12', status: 'Resolved', history: ['14:24:12 — Warning threshold reached', '14:29:40 — Resolved by operator'] },
];
// Future Flask integration boundary. Demo screens never call or pretend to call an API.
export function createMonitoringApi(baseUrl: string) {
  async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', ...(body ? { body: JSON.stringify(body) } : {}) });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response.json() as Promise<T>;
  }
  return {
    login: (username: string, password: string) => request('/api/login', 'POST', { username, password }),
    logout: () => request('/api/logout', 'POST'),
    cameras: () => request<Camera[]>('/api/cameras'),
    saveCamera: (camera: Camera, isNew: boolean) => request(isNew ? '/api/cameras' : `/api/cameras/${camera.id}`, isNew ? 'POST' : 'PUT', camera),
    deleteCamera: (id: string) => request(`/api/cameras/${id}`, 'DELETE'),
    monitoring: () => request('/api/monitoring/status'),
    start: (cameraId: string) => request('/api/monitoring/start', 'POST', { camera_id: cameraId }),
    stop: () => request('/api/monitoring/stop', 'POST'),
    zones: () => request<Zone[]>('/api/zones'),
    saveZone: (zone: Zone) => request(`/api/zones/${zone.id}`, 'PUT', zone),
    alerts: () => request<SafetyAlert[]>('/api/alerts'),
    updateAlert: (id: string, action: 'acknowledge' | 'resolve') => request(`/api/alerts/${id}/${action}`, 'PUT'),
    analytics: () => request('/api/analytics'),
    assistant: () => request('/api/ai-assistant', 'POST'),
  };
}
export const zoneStatus = (z: Zone) => !z.enabled ? 'Disabled' : z.people / z.capacity * 100 >= z.critical ? 'Critical' : z.people / z.capacity * 100 >= z.warning ? 'Warning' : 'Normal';
