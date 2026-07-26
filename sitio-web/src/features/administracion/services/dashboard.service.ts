import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth-cookies';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export type PanelStat = { label: string; value: number };

export type PanelAlert = {
  id: string;
  title: string;
  type: string;
  message: string;
  date: string;
};

export type PanelActivity = {
  id: string;
  action: string;
  user: string;
  date: string;
  description: string;
};

export type PanelGeneralSummary = {
  stats: PanelStat[];
  recentActivity: PanelActivity[];
  alerts: PanelAlert[];
};

export async function getPanelGeneralSummary(): Promise<PanelGeneralSummary> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) return { stats: [], recentActivity: [], alerts: [] };

    const headers = { Authorization: `Bearer ${token}` };

    const [usersRes, alertsRes] = await Promise.allSettled([
      fetch(`${BACKEND_URL}/api/users`, { headers }),
      fetch(`${BACKEND_URL}/api/alerts?windowDays=7`, { headers }),
    ]);

    const stats: PanelStat[] = [];
    const recentActivity: PanelActivity[] = [];
    let alerts: PanelAlert[] = [];

    if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
      const users = await usersRes.value.json();
      stats.push({ label: 'Usuarios', value: Array.isArray(users) ? users.length : 0 });
    }

    if (alertsRes.status === 'fulfilled' && alertsRes.value.ok) {
      const data = await alertsRes.value.json();
      alerts = data.alerts || [];
      stats.push({ label: 'Alertas de Caducidad', value: data.count || 0 });
    }

    return { stats, recentActivity, alerts };
  } catch {
    return { stats: [], recentActivity: [], alerts: [] };
  }
}
