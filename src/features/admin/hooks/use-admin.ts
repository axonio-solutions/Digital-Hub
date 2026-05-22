export const adminKeys = {
  all: ['admin'] as const,
  metrics: () => [...adminKeys.all, 'metrics'] as const,
  analytics: (type: 'buyers' | 'sellers') =>
    [...adminKeys.all, 'analytics', type] as const,
  systemMetrics: () => [...adminKeys.all, 'analytics', 'system'] as const,
  dashboardStats: () => [...adminKeys.all, 'dashboard', 'stats'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  marketGap: () => [...adminKeys.all, 'marketGap'] as const,
}
