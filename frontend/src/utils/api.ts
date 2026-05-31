const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

// ─── Universes ───────────────────────────────────────────────────────────────
export const api = {
  universes: {
    list: () => request<any[]>('/api/universes/'),
    get: (id: string) => request<any>(`/api/universes/${id}`),
    create: (data: { name: string; description?: string }) =>
      request<any>('/api/universes/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/api/universes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<null>(`/api/universes/${id}`, { method: 'DELETE' }),
    compile: (id: string) => request<any>(`/api/universes/${id}/compile`, { method: 'POST' }),
    sync: (id: string, data: { events: any[]; relationships: any[] }) =>
      request<any>(`/api/universes/${id}/sync`, { method: 'POST', body: JSON.stringify(data) }),
  },

  events: {
    create: (universeId: string, data: any) =>
      request<any>(`/api/universes/${universeId}/events`, { method: 'POST', body: JSON.stringify(data) }),
    update: (universeId: string, eventId: string, data: any) =>
      request<any>(`/api/universes/${universeId}/events/${eventId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (universeId: string, eventId: string) =>
      request<null>(`/api/universes/${universeId}/events/${eventId}`, { method: 'DELETE' }),
  },

  relationships: {
    create: (universeId: string, data: any) =>
      request<any>(`/api/universes/${universeId}/relationships`, { method: 'POST', body: JSON.stringify(data) }),
    delete: (universeId: string, relId: string) =>
      request<null>(`/api/universes/${universeId}/relationships/${relId}`, { method: 'DELETE' }),
  },

  // ─── Analysis ─────────────────────────────────────────────────────────────
  analysis: {
    paradoxes: (universeId: string) => request<any>(`/api/analysis/${universeId}/paradoxes`),
    influence: (universeId: string) => request<any>(`/api/analysis/${universeId}/influence`),
    consequences: (universeId: string, eventId: string) =>
      request<any>(`/api/analysis/${universeId}/consequences/${eventId}`),
    counterfactual: (universeId: string, eventId: string) =>
      request<any>(`/api/analysis/${universeId}/counterfactual/${eventId}`),
    collapse: (universeId: string, eventId: string) =>
      request<any>(`/api/analysis/${universeId}/collapse/${eventId}`),
    knowledge: (universeId: string) => request<any>(`/api/analysis/${universeId}/knowledge`),
    dashboard: (universeId: string) => request<any>(`/api/analysis/${universeId}/dashboard`),
  },

  // ─── Timeline ─────────────────────────────────────────────────────────────
  timeline: {
    compile: (universeId: string) => request<any>(`/api/timeline/${universeId}/compile`),
    activationTimes: (universeId: string) => request<any>(`/api/timeline/${universeId}/activation-times`),
  },

  // ─── Multiverse ───────────────────────────────────────────────────────────
  multiverse: {
    branch: (universeId: string, data: { branch_event_id: string; branch_name: string }) =>
      request<any>(`/api/multiverse/${universeId}/branch`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // ─── Parser ───────────────────────────────────────────────────────────────
  parser: {
    parse: (text: string, universeName?: string) =>
      request<any>('/api/parser/parse', {
        method: 'POST',
        body: JSON.stringify({ text, universe_name: universeName }),
      }),
    status: () => request<any>('/api/parser/status'),
  },

  health: () => request<any>('/health'),
};
