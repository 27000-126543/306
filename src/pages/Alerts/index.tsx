import { useState } from 'react'
import { AlertTriangle, AlertCircle, ThermometerSun, Gauge, Clock, CheckCircle, XCircle, ChevronRight, Filter, Search } from 'lucide-react'
import { useAppStore } from '@/store'
import type { Alert, AlertLevel, AlertStatus } from '@/types'

const LEVEL_CONFIG: Record<AlertLevel, { label: string; color: string; bg: string; icon: typeof AlertTriangle }> = {
  1: { label: '一级', color: '#F59E0B', bg: 'bg-[#F59E0B]/10', icon: AlertCircle },
  2: { label: '二级', color: '#F97316', bg: 'bg-[#F97316]/10', icon: AlertTriangle },
  3: { label: '三级', color: '#EF4444', bg: 'bg-[#EF4444]/10', icon: AlertTriangle },
}

const STATUS_CONFIG: Record<AlertStatus, { label: string; color: string; bg: string }> = {
  pending: { label: '待处理', color: '#F59E0B', bg: 'bg-[#F59E0B]/10' },
  confirmed: { label: '已确认', color: '#3B82F6', bg: 'bg-[#3B82F6]/10' },
  reviewed: { label: '已复核', color: '#F97316', bg: 'bg-[#F97316]/10' },
  approved: { label: '已批准', color: '#22C55E', bg: 'bg-[#22C55E]/10' },
  resolved: { label: '已解决', color: '#94A3B8', bg: 'bg-[#94A3B8]/10' },
}

const STEPS = ['运维员确认', '区域经理复核', '总部调度批准']

function ApprovalStepper({ chain }: { chain: Alert['approvalChain'] }) {
  return (
    <div className="space-y-0">
      {STEPS.map((title, i) => {
        const step = chain.find((s) => s.step === i + 1)
        const done = step?.status === 'approved'
        const rejected = step?.status === 'rejected'
        const active = step?.status === 'pending'
        const none = !step
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${done ? 'bg-[#22C55E] text-white' : rejected ? 'bg-[#EF4444] text-white' : active ? 'bg-[#F97316] text-white' : 'bg-[#334155] text-[#64748B]'}`}>
                {done ? <CheckCircle className="w-4 h-4" /> : rejected ? <XCircle className="w-4 h-4" /> : active ? <Clock className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-px h-8 ${done ? 'bg-[#22C55E]' : 'bg-[#334155]'}`} />}
            </div>
            <div className={`pb-4 ${none ? 'text-[#475569]' : ''}`}>
              <div className="text-xs font-medium text-[#F1F5F9]">{title}</div>
              {step && (
                <div className="text-xs text-[#94A3B8] mt-0.5">
                  {step.assignee && <span>{step.assignee}</span>}
                  {step.timestamp && <span className="ml-2 font-mono">{step.timestamp}</span>}
                </div>
              )}
              {step?.comment && <div className="text-xs text-[#64748B] mt-1">{step.comment}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StatusBadge({ status }: { status: AlertStatus }) {
  const cfg = STATUS_CONFIG[status]
  return <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg}`} style={{ color: cfg.color }}>{cfg.label}</span>
}

export default function Alerts() {
  const alerts = useAppStore(s => s.alerts)
  const advanceAlert = useAppStore(s => s.advanceAlert)
  const getVisibleAlerts = useAppStore(s => s.getVisibleAlerts)
  const visibleAlerts = getVisibleAlerts()

  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  const selectedAlert = selectedAlertId ? alerts.find(a => a.alertId === selectedAlertId) || null : null

  const [levelFilter, setLevelFilter] = useState<string>('全部')
  const [typeFilter, setTypeFilter] = useState<string>('全部')
  const [statusFilter, setStatusFilter] = useState<string>('全部')
  const [search, setSearch] = useState('')

  const filtered = visibleAlerts.filter((a) => {
    if (levelFilter !== '全部' && a.level !== Number(levelFilter)) return false
    if (typeFilter !== '全部' && a.type !== typeFilter) return false
    if (statusFilter !== '全部' && a.status !== statusFilter) return false
    if (search && !a.description.includes(search) && !a.region.includes(search) && !a.stationName.includes(search)) return false
    return true
  })

  const counts = { 1: 0, 2: 0, 3: 0 } as Record<AlertLevel, number>
  alerts.forEach((a) => { counts[a.level]++ })

  const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] text-xs rounded px-2 py-1.5 outline-none focus:border-[#F97316]">
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  )

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        {([1, 2, 3] as AlertLevel[]).map((lv) => {
          const cfg = LEVEL_CONFIG[lv]
          const Icon = cfg.icon
          return (
            <div key={lv} className="bg-[#1E293B] border border-[#334155] rounded-lg p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center`} style={{ color: cfg.color }}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[#94A3B8]">{cfg.label}预警</div>
                <div className="text-2xl font-bold" style={{ color: cfg.color }}>{counts[lv]}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3 bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2.5">
        <Filter className="w-4 h-4 text-[#64748B]" />
        <Select value={levelFilter} onChange={setLevelFilter} options={['全部', '1', '2', '3']} />
        <Select value={typeFilter} onChange={setTypeFilter} options={['全部', 'temperature', 'pressure']} />
        <Select value={statusFilter} onChange={setStatusFilter} options={['全部', 'pending', 'confirmed', 'reviewed', 'approved', 'resolved']} />
        <div className="flex-1" />
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-2 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索区域/站名/描述"
            className="bg-[#0F172A] border border-[#334155] text-xs text-[#F1F5F9] rounded pl-8 pr-3 py-1.5 w-52 outline-none focus:border-[#F97316]" />
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 overflow-auto space-y-3 pr-1">
          {filtered.map((alert) => {
            const cfg = LEVEL_CONFIG[alert.level]
            const TypeIcon = alert.type === 'temperature' ? ThermometerSun : Gauge
            const selected = selectedAlertId === alert.alertId
            return (
              <div key={alert.alertId} onClick={() => setSelectedAlertId(alert.alertId)}
                className={`bg-[#1E293B] border rounded-lg overflow-hidden cursor-pointer transition-colors ${selected ? 'border-[#F97316]' : 'border-[#334155] hover:border-[#475569]'}`}>
                <div className="flex">
                  <div className="w-1 shrink-0" style={{ backgroundColor: cfg.color }} />
                  <div className="flex-1 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${cfg.bg} font-medium`} style={{ color: cfg.color }}>{cfg.label}</span>
                      <TypeIcon className="w-3.5 h-3.5 text-[#64748B]" />
                      <span className="text-xs text-[#94A3B8]">{alert.region} · {alert.stationName}</span>
                      <div className="flex-1" />
                      <StatusBadge status={alert.status} />
                    </div>
                    <div className="text-xs text-[#CBD5E1] leading-relaxed">{alert.description}</div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B]">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /><span className="font-mono">{alert.createdAt}</span></span>
                      {alert.updatedAt !== alert.createdAt && <span className="font-mono">更新 {alert.updatedAt}</span>}
                    </div>
                    {alert.approvalChain.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {STEPS.map((_, i) => {
                          const s = alert.approvalChain[i]
                          const done = s?.status === 'approved'
                          return (
                            <div key={i} className="flex items-center gap-1">
                              {i > 0 && <div className={`w-6 h-px ${done ? 'bg-[#22C55E]' : 'bg-[#334155]'}`} />}
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px]
                                ${done ? 'bg-[#22C55E] text-white' : s?.status === 'pending' ? 'bg-[#F97316] text-white' : 'bg-[#334155] text-[#64748B]'}`}>
                                {done ? '✓' : i + 1}
                              </div>
                            </div>
                          )
                        })}
                        <ChevronRight className="w-3 h-3 text-[#64748B] ml-1" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <div className="text-center text-sm text-[#64748B] py-12">暂无匹配的告警记录</div>}
        </div>

        {selectedAlert && (
          <div className="w-96 bg-[#1E293B] border border-[#334155] rounded-lg p-4 overflow-auto shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ color: LEVEL_CONFIG[selectedAlert.level].color, backgroundColor: `${LEVEL_CONFIG[selectedAlert.level].color}15` }}>
                {LEVEL_CONFIG[selectedAlert.level].label}
              </span>
              <StatusBadge status={selectedAlert.status} />
              <div className="flex-1" />
              <button onClick={() => setSelectedAlertId(null)} className="text-[#64748B] hover:text-[#F1F5F9] text-xs">关闭</button>
            </div>
            <div className="space-y-3 mb-6">
              <div><span className="text-xs text-[#64748B]">区域 / 站点</span><div className="text-sm text-[#F1F5F9]">{selectedAlert.region} · {selectedAlert.stationName}</div></div>
              <div><span className="text-xs text-[#64748B]">告警类型</span><div className="text-sm text-[#F1F5F9]">{selectedAlert.type === 'temperature' ? '温度异常' : '压力异常'}</div></div>
              <div><span className="text-xs text-[#64748B]">告警描述</span><div className="text-sm text-[#CBD5E1] leading-relaxed">{selectedAlert.description}</div></div>
              <div className="flex gap-6">
                <div><span className="text-xs text-[#64748B]">创建时间</span><div className="text-xs text-[#94A3B8] font-mono">{selectedAlert.createdAt}</div></div>
                <div><span className="text-xs text-[#64748B]">更新时间</span><div className="text-xs text-[#94A3B8] font-mono">{selectedAlert.updatedAt}</div></div>
              </div>
              <div><span className="text-xs text-[#64748B]">负责人</span><div className="text-sm text-[#F1F5F9]">{selectedAlert.assignedTo}</div></div>
            </div>
            <div className="border-t border-[#334155] pt-4">
              <div className="text-xs text-[#94A3B8] font-medium mb-3">审批流程</div>
              <ApprovalStepper chain={selectedAlert.approvalChain} />
            </div>
            <div className="border-t border-[#334155] pt-4 mt-4 flex gap-2">
              {selectedAlert.status === 'pending' && <button onClick={() => advanceAlert(selectedAlertId!)} className="flex-1 bg-[#F97316] text-white text-xs py-2 rounded hover:bg-[#EA580C]">确认告警</button>}
              {selectedAlert.status === 'confirmed' && <button onClick={() => advanceAlert(selectedAlertId!)} className="flex-1 bg-[#F97316] text-white text-xs py-2 rounded hover:bg-[#EA580C]">复核通过</button>}
              {selectedAlert.status === 'reviewed' && <button onClick={() => advanceAlert(selectedAlertId!)} className="flex-1 bg-[#22C55E] text-white text-xs py-2 rounded hover:bg-[#16A34A]">批准方案</button>}
              {selectedAlert.status === 'approved' && <button onClick={() => advanceAlert(selectedAlertId!)} className="flex-1 bg-[#64748B] text-white text-xs py-2 rounded hover:bg-[#475569]">标记解决</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
