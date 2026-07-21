import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth-cookies';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function getPanelGeneralSummary(role: string | null) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) return { stats: [], recentActivity: [], alerts: [] };

    const headers = { Authorization: `Bearer ${token}` };

    const [usersRes, alertsRes] = await Promise.allSettled([
      fetch(`${BACKEND_URL}/api/users`, { headers }),
      fetch(`${BACKEND_URL}/api/alerts?windowDays=7`, { headers }),
    ]);

    const stats = [];
    let recentActivity: any[] = [];
    let alerts: any[] = [];

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
