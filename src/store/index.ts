import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMemo } from 'react'
import type { UserRole, UserInfo, Alert, AlertStatus, WorkOrder, WorkOrderStatus } from '@/types'
import { alertsData as initialAlerts } from '@/data/mockData'

export const ROLE_REGION_MAP: Record<UserRole, { region: string; cityIds: string[] }> = {
  headquarters: { region: '全国', cityIds: [] },
  regional: { region: '华北区域', cityIds: ['beijing', 'tianjin', 'tangshan', 'shijiazhuang', 'taiyuan'] },
  team_leader: { region: '海淀区', cityIds: ['beijing'] },
  operator: { region: '中关村换热站', cityIds: ['beijing'] },
}

function nowStr() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

interface AppState {
  currentUser: UserInfo | null
  currentCityId: string | null
  sidebarCollapsed: boolean
  alerts: Alert[]
  workOrders: WorkOrder[]
  login: (user: UserInfo) => void
  logout: () => void
  setCurrentCityId: (cityId: string | null) => void
  toggleSidebar: () => void
  advanceAlert: (alertId: string) => void
  createWorkOrder: (wo: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => string
  updateWorkOrderStatus: (woId: string, status: WorkOrderStatus) => void
  addWorkOrderProgress: (woId: string, content: string) => void
  getWorkOrdersByStation: (stationId: string) => WorkOrder[]
  getWorkOrdersByAlert: (alertId: string) => WorkOrder[]
  getVisibleCityIds: () => string[]
  getVisibleAlerts: () => Alert[]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: {
        id: 'u001',
        name: '张建国',
        role: 'headquarters' as UserRole,
        region: '全国',
      },
      currentCityId: null,
      sidebarCollapsed: false,
      alerts: JSON.parse(JSON.stringify(initialAlerts)),
      workOrders: [],

      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      setCurrentCityId: (cityId) => set({ currentCityId: cityId }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      advanceAlert: (alertId: string) => {
        set((state) => {
          const alerts = state.alerts.map((a) => {
            if (a.alertId !== alertId) return a
            const now = nowStr()
            const user = state.currentUser!
            let newStatus: AlertStatus = a.status
            let newChain = [...a.approvalChain]

            if (a.status === 'pending') {
              newStatus = 'confirmed'
              newChain = [...newChain, { step: 1, role: '运维员', assignee: user.name, status: 'approved' as const, comment: '已确认告警，正在排查原因', timestamp: now }]
            } else if (a.status === 'confirmed') {
              newStatus = 'reviewed'
              newChain = newChain.map((s) =>
                s.step === 2 ? { ...s, assignee: user.name, status: 'approved' as const, comment: '复核确认，同意启动审批流程', timestamp: now } : s
              )
              if (!newChain.find((s) => s.step === 2)) {
                newChain.push({ step: 2, role: '区域经理', assignee: user.name, status: 'approved' as const, comment: '复核确认，同意启动审批流程', timestamp: now })
              }
            } else if (a.status === 'reviewed') {
              newStatus = 'approved'
              newChain = newChain.map((s) =>
                s.step === 3 ? { ...s, assignee: user.name, status: 'approved' as const, comment: '批准调度方案，立即执行', timestamp: now } : s
              )
              if (!newChain.find((s) => s.step === 3)) {
                newChain.push({ step: 3, role: '总部调度', assignee: user.name, status: 'approved' as const, comment: '批准调度方案，立即执行', timestamp: now })
              }
            } else if (a.status === 'approved') {
              newStatus = 'resolved'
              newChain = newChain.map((s) =>
                s.step === 3 ? { ...s, comment: s.comment + '；已解决', timestamp: now } : s
              )
            }

            return { ...a, status: newStatus, updatedAt: now, approvalChain: newChain }
          })
          return { alerts }
        })
      },

      getVisibleCityIds: () => {
        const user = get().currentUser
        if (!user) return []
        const mapping = ROLE_REGION_MAP[user.role]
        if (user.role === 'headquarters') return []
        return mapping.cityIds
      },

      createWorkOrder: (wo) => {
        const id = `wo_${Date.now()}`
        const now = nowStr()
        const newWo: WorkOrder = { ...wo, id, createdAt: now, updatedAt: now, progress: [] }
        set((state) => ({ workOrders: [...state.workOrders, newWo] }))
        return id
      },

      updateWorkOrderStatus: (woId, status) => {
        set((state) => ({
          workOrders: state.workOrders.map((wo) =>
            wo.id === woId ? { ...wo, status, updatedAt: nowStr() } : wo
          ),
        }))
      },

      addWorkOrderProgress: (woId, content) => {
        const user = get().currentUser
        set((state) => ({
          workOrders: state.workOrders.map((wo) =>
            wo.id === woId
              ? {
                  ...wo,
                  updatedAt: nowStr(),
                  progress: [
                    ...wo.progress,
                    { id: `wp_${Date.now()}`, content, operator: user?.name || '', timestamp: nowStr() },
                  ],
                }
              : wo
          ),
        }))
      },

      getWorkOrdersByStation: (stationId) => {
        return get().workOrders.filter((wo) => wo.stationId === stationId)
      },

      getWorkOrdersByAlert: (alertId) => {
        return get().workOrders.filter((wo) => wo.alertId === alertId)
      },

      getVisibleAlerts: () => {
        const user = get().currentUser
        const alerts = get().alerts
        if (!user) return []
        if (user.role === 'headquarters') return alerts
        const mapping = ROLE_REGION_MAP[user.role]
        if (user.role === 'regional') {
          return alerts.filter((a) => mapping.cityIds.includes(a.cityId))
        }
        if (user.role === 'team_leader') {
          return alerts.filter((a) => a.cityId === 'beijing' && a.assignedTo === user.name)
        }
        return alerts.filter((a) => a.cityId === 'beijing' && a.assignedTo === user.name && a.stationName.includes('中关村'))
      },
    }),
    {
      name: 'heat-monitor-store',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
)

export const canViewNational = (role: UserRole) => role === 'headquarters'
export const canViewRegional = (role: UserRole) => role === 'headquarters' || role === 'regional'
export const canApproveLevel2 = (role: UserRole) => role === 'headquarters' || role === 'regional'
export const canApproveLevel3 = (role: UserRole) => role === 'headquarters'

export const filterCitiesByRole = (cities: any[], role: UserRole): any[] => {
  if (role === 'headquarters') return cities
  const mapping = ROLE_REGION_MAP[role]
  if (role === 'regional') return cities.filter((c: any) => mapping.cityIds.includes(c.cityId))
  if (role === 'team_leader') return cities.filter((c: any) => mapping.cityIds.includes(c.cityId))
  return cities.filter((c: any) => mapping.cityIds.includes(c.cityId))
}

export function useVisibleAlerts(): Alert[] {
  const alerts = useAppStore((s) => s.alerts)
  const currentUser = useAppStore((s) => s.currentUser)
  return useMemo(() => {
    if (!currentUser) return []
    if (currentUser.role === 'headquarters') return alerts
    const mapping = ROLE_REGION_MAP[currentUser.role]
    if (currentUser.role === 'regional') {
      return alerts.filter((a) => mapping.cityIds.includes(a.cityId))
    }
    if (currentUser.role === 'team_leader') {
      return alerts.filter((a) => mapping.cityIds.includes(a.cityId))
    }
    return alerts.filter((a) => mapping.cityIds.includes(a.cityId) && a.stationName.includes('中关村'))
  }, [alerts, currentUser])
}
