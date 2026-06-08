import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { ArrowLeft, Search, Filter, ThermometerSun, BarChart3, Wrench, Camera, Send, Plus, RefreshCw, CheckCircle2 } from 'lucide-react'
import { cityHeatData, cityHasDetail, getDistrictsForCity, getStationsForCity, getBoxPlotForCity, getTempHistoryForStation } from '@/data/mockData'
import { useAppStore, ROLE_REGION_MAP } from '@/store'
import type { WorkOrder, WorkOrderStatus } from '@/types'

const statusMap: Record<string, { label: string; bg: string }> = {
  normal: { label: '正常', bg: 'bg-green-500/20 text-green-400' },
  warning: { label: '预警', bg: 'bg-yellow-500/20 text-yellow-400' },
  error: { label: '故障', bg: 'bg-red-500/20 text-red-400' },
}

const WO_STATUS: Record<WorkOrderStatus, { label: string; color: string; bg: string }> = {
  pending_inspect: { label: '待排查', color: '#F59E0B', bg: 'bg-[#F59E0B]/10' },
  in_progress: { label: '处理中', color: '#3B82F6', bg: 'bg-[#3B82F6]/10' },
  pending_review: { label: '待复核', color: '#8B5CF6', bg: 'bg-[#8B5CF6]/10' },
  recovered: { label: '已恢复', color: '#22C55E', bg: 'bg-[#22C55E]/10' },
}

const NEXT_STATUS: Record<WorkOrderStatus, WorkOrderStatus> = {
  pending_inspect: 'in_progress',
  in_progress: 'pending_review',
  pending_review: 'recovered',
  recovered: 'recovered',
}

export default function RegionDetail() {
  const { cityId } = useParams<{ cityId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentUser = useAppStore((s) => s.currentUser)
  const workOrders = useAppStore((s) => s.workOrders)
  const createWorkOrder = useAppStore((s) => s.createWorkOrder)
  const updateWorkOrderStatus = useAppStore((s) => s.updateWorkOrderStatus)
  const addWorkOrderProgress = useAppStore((s) => s.addWorkOrderProgress)

  const id = cityId || 'beijing'
  const city = cityHeatData.find((c) => c.cityId === id) || cityHeatData.find((c) => c.cityId === 'beijing')!
  const hasDetail = cityHasDetail(id)

  const districts = useMemo(() => hasDetail ? getDistrictsForCity(id) : [], [id, hasDetail])
  const rawStations = useMemo(() => hasDetail ? getStationsForCity(id) : [], [id, hasDetail])
  const allStations = useMemo(() => {
    if (!currentUser) return rawStations
    if (currentUser.role === 'headquarters' || currentUser.role === 'regional') return rawStations
    if (currentUser.role === 'team_leader') {
      return rawStations.filter((s) => s.districtName.includes('海淀'))
    }
    return rawStations.filter((s) => s.stationName.includes('中关村'))
  }, [rawStations, currentUser])
  const boxPlotData = useMemo(() => {
    if (!currentUser) return hasDetail ? getBoxPlotForCity(id) : []
    if (currentUser.role === 'team_leader') {
      const full = hasDetail ? getBoxPlotForCity(id) : []
      return full.filter((d) => d.districtName.includes('海淀'))
    }
    if (currentUser.role === 'operator') return []
    return hasDetail ? getBoxPlotForCity(id) : []
  }, [id, hasDetail, currentUser])

  const getTempHistory = (stationId: string) => {
    const station = allStations.find(s => s.stationId === stationId)
    if (!station) return []
    return getTempHistoryForStation(station)
  }

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [showFormFor, setShowFormFor] = useState<string | null>(null)
  const [formFinding, setFormFinding] = useState('')
  const [formAction, setFormAction] = useState('')
  const [formEstRecovery, setFormEstRecovery] = useState('')
  const [progressInput, setProgressInput] = useState<Record<string, string>>({})

  const urlStation = searchParams.get('station')
  const urlWoId = searchParams.get('woId')

  useEffect(() => {
    if (currentUser?.role === 'operator' && allStations.length > 0 && selected.size === 0) {
      setSelected(new Set([allStations[0].stationId]))
    }
  }, [currentUser, allStations, selected.size])

  useEffect(() => {
    if (urlStation && allStations.length > 0) {
      const match = allStations.find(s => s.stationName === urlStation)
      if (match) {
        setSelected(new Set([match.stationId]))
        if (urlWoId) setShowFormFor(match.stationId)
      }
    }
  }, [urlStation, urlWoId, allStations])

  const filtered = useMemo(() => {
    return allStations.filter((s) => {
      if (search && !s.stationName.includes(search)) return false
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (districtFilter !== 'all' && s.districtId !== districtFilter) return false
      return true
    })
  }, [allStations, search, statusFilter, districtFilter])

  const toggleStation = (sid: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(sid) ? next.delete(sid) : next.add(sid)
      return next
    })
  }

  const visibleDistricts = useMemo(() => {
    if (!currentUser) return districts
    if (currentUser.role === 'team_leader') return districts.filter((d) => d.districtName.includes('海淀'))
    if (currentUser.role === 'operator') return []
    return districts
  }, [districts, currentUser])

  const kpiOption = useMemo(() => ({
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['供热效率', '达标率', '热损耗率'], textStyle: { color: '#94A3B8' } },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category' as const, data: visibleDistricts.map((d) => d.districtName), axisLabel: { color: '#94A3B8' } },
    yAxis: { type: 'value' as const, axisLabel: { color: '#94A3B8' } },
    series: [
      { name: '供热效率', type: 'bar', data: visibleDistricts.map((d) => d.heatingEfficiency), itemStyle: { color: '#3B82F6' } },
      { name: '达标率', type: 'bar', data: visibleDistricts.map((d) => d.complianceRate), itemStyle: { color: '#22C55E' } },
      { name: '热损耗率', type: 'bar', data: visibleDistricts.map((d) => d.heatLossRate), itemStyle: { color: '#F97316' } },
    ],
  }), [visibleDistricts])

  const trendOption = useMemo(() => {
    const sids = Array.from(selected)
    if (!sids.length) return null
    const firstHistory = getTempHistory(sids[0])
    const dates = firstHistory?.map((p) => p.time) || []
    const series = sids.flatMap((sid) => {
      const h = getTempHistory(sid)
      const name = allStations.find((s) => s.stationId === sid)?.stationName || sid
      return [
        { name: `${name}-供水`, type: 'line', smooth: true, data: h?.map((p) => p.supplyTemp), lineStyle: { color: '#F97316' }, itemStyle: { color: '#F97316' } },
        { name: `${name}-回水`, type: 'line', smooth: true, data: h?.map((p) => p.returnTemp), lineStyle: { color: '#3B82F6' }, itemStyle: { color: '#3B82F6' } },
      ]
    })
    return {
      tooltip: { trigger: 'axis' as const },
      legend: { textStyle: { color: '#94A3B8', fontSize: 10 }, type: 'scroll' as const },
      grid: { left: 40, right: 20, top: 40, bottom: 30 },
      xAxis: { type: 'category' as const, data: dates, axisLabel: { color: '#94A3B8' } },
      yAxis: { type: 'value' as const, name: '°C', axisLabel: { color: '#94A3B8' } },
      series,
    }
  }, [selected, allStations])

  const boxPlotOption = useMemo(() => {
    const boxData = boxPlotData.map((d) => [d.min, d.q1, d.median, d.q3, d.max])
    const outliers = boxPlotData.flatMap((d, i) => d.outliers.map((o) => [i, o]))
    return {
      tooltip: { trigger: 'item' as const },
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category' as const, data: boxPlotData.map((d) => d.districtName), axisLabel: { color: '#94A3B8' } },
      yAxis: { type: 'value' as const, name: '°C', axisLabel: { color: '#94A3B8' } },
      series: [
        { type: 'boxplot', data: boxData, itemStyle: { color: '#3B82F6', borderColor: '#3B82F6' } },
        { type: 'scatter', data: outliers, symbolSize: 6, itemStyle: { color: '#F97316' } },
      ],
    }
  }, [boxPlotData])

  const handleCreateWorkOrder = (stationId: string) => {
    if (!formFinding && !formAction) return
    const station = allStations.find((s) => s.stationId === stationId)
    if (!station) return
    createWorkOrder({
      stationId,
      stationName: station.stationName,
      finding: formFinding,
      action: formAction,
      estimatedRecovery: formEstRecovery,
      status: 'pending_inspect',
      operator: currentUser?.name || '',
      assignee: currentUser?.name || '',
    })
    setFormFinding('')
    setFormAction('')
    setFormEstRecovery('')
    setShowFormFor(null)
  }

  const stationWorkOrders = (sid: string) => workOrders.filter((wo) => wo.stationId === sid)

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-[#1E293B] border border-[#334155] hover:bg-[#334155]">
          <ArrowLeft size={18} className="text-[#94A3B8]" />
        </button>
        <h1 className="text-lg font-semibold text-white">{city.cityName} · 区域详情</h1>
      </div>

      {!hasDetail ? (
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-12 flex flex-col items-center justify-center">
          <p className="text-[#94A3B8] text-sm mb-4">{city.cityName}暂无站点明细数据</p>
          <button onClick={() => navigate(-1)} className="text-[#F97316] text-sm hover:underline">返回总览</button>
        </div>
      ) : (
        <>
          {visibleDistricts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={16} className="text-[#3B82F6]" />
                  <span className="text-xs text-[#94A3B8]">区县KPI对比</span>
                </div>
                <ReactECharts option={kpiOption} style={{ height: 260 }} />
              </div>
              {boxPlotData.length > 0 ? (
                <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ThermometerSun size={16} className="text-[#F97316]" />
                    <span className="text-xs text-[#94A3B8]">室温分布箱线图</span>
                  </div>
                  <ReactECharts option={boxPlotOption} style={{ height: 260 }} />
                </div>
              ) : (
                <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 flex items-center justify-center">
                  <span className="text-[#94A3B8] text-xs">当前角色无箱线图数据</span>
                </div>
              )}
            </div>
          )}

          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={16} className="text-[#94A3B8]" />
              <span className="text-xs text-[#94A3B8]">换热站列表</span>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索站名"
                    className="pl-7 pr-2 py-1 text-xs bg-[#0F172A] border border-[#334155] rounded text-white placeholder-[#94A3B8] outline-none" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1 text-xs bg-[#0F172A] border border-[#334155] rounded text-[#94A3B8] outline-none">
                  <option value="all">全部状态</option>
                  <option value="normal">正常</option>
                  <option value="warning">预警</option>
                  <option value="error">故障</option>
                </select>
                <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}
                  className="px-2 py-1 text-xs bg-[#0F172A] border border-[#334155] rounded text-[#94A3B8] outline-none">
                  <option value="all">全部区县</option>
                  {visibleDistricts.map((d) => <option key={d.districtId} value={d.districtId}>{d.districtName}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[#94A3B8] border-b border-[#334155]">
                    <th className="py-2 px-3 text-left font-normal">站名</th>
                    <th className="py-2 px-3 text-left font-normal">区县</th>
                    <th className="py-2 px-3 text-right font-normal">供水温℃</th>
                    <th className="py-2 px-3 text-right font-normal">回水温℃</th>
                    <th className="py-2 px-3 text-right font-normal">压力MPa</th>
                    <th className="py-2 px-3 text-right font-normal">达标率%</th>
                    <th className="py-2 px-3 text-center font-normal">状态</th>
                    <th className="py-2 px-3 text-center font-normal">工单</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const woCount = stationWorkOrders(s.stationId).length
                    return (
                      <tr key={s.stationId} onClick={() => toggleStation(s.stationId)}
                        className={`border-b border-[#334155]/50 cursor-pointer hover:bg-[#334155]/30 ${selected.has(s.stationId) ? 'border-l-2 border-l-[#F97316]' : 'border-l-2 border-l-transparent'}`}>
                        <td className="py-2 px-3 text-white">{s.stationName}</td>
                        <td className="py-2 px-3 text-[#94A3B8]">{s.districtName}</td>
                        <td className="py-2 px-3 text-right font-mono text-white">{s.supplyTemp}</td>
                        <td className="py-2 px-3 text-right font-mono text-white">{s.returnTemp}</td>
                        <td className="py-2 px-3 text-right font-mono text-white">{s.pressure}</td>
                        <td className="py-2 px-3 text-right font-mono text-white">{s.complianceRate}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${statusMap[s.status].bg}`}>
                            {statusMap[s.status].label}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button onClick={(e) => { e.stopPropagation(); setShowFormFor(s.stationId) }}
                            className="text-[#F97316] hover:text-[#EA580C] text-[10px] flex items-center gap-1 mx-auto">
                            <Wrench className="w-3 h-3" />{woCount > 0 ? `${woCount}` : '处置'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {showFormFor && (
              <div className="mt-4 border border-[#334155] rounded-lg p-4 bg-[#0F172A]/60">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-4 h-4 text-[#F97316]" />
                  <span className="text-xs text-[#F1F5F9] font-medium">登记处置工单 — {allStations.find(s => s.stationId === showFormFor)?.stationName}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#94A3B8] mb-1 block">排查结果</label>
                    <input value={formFinding} onChange={(e) => setFormFinding(e.target.value)}
                      placeholder="如：供水温度偏低，疑似管道堵塞"
                      className="w-full text-xs bg-[#1E293B] border border-[#334155] rounded px-3 py-2 text-white placeholder-[#64748B] outline-none focus:border-[#F97316]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#94A3B8] mb-1 block">处理措施</label>
                    <input value={formAction} onChange={(e) => setFormAction(e.target.value)}
                      placeholder="如：已通知抢修班组，正在疏通管道"
                      className="w-full text-xs bg-[#1E293B] border border-[#334155] rounded px-3 py-2 text-white placeholder-[#64748B] outline-none focus:border-[#F97316]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#94A3B8] mb-1 block">预计恢复时间</label>
                    <input value={formEstRecovery} onChange={(e) => setFormEstRecovery(e.target.value)}
                      placeholder="如：2小时内恢复"
                      className="w-full text-xs bg-[#1E293B] border border-[#334155] rounded px-3 py-2 text-white placeholder-[#64748B] outline-none focus:border-[#F97316]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#94A3B8] mb-1 block">现场照片</label>
                    <div className="flex items-center gap-2 bg-[#1E293B] border border-[#334155] rounded px-3 py-2 text-[#64748B] text-xs cursor-pointer hover:border-[#475569]">
                      <Camera className="w-3.5 h-3.5" />
                      <span>点击上传（占位）</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 justify-end">
                  <button onClick={() => { setShowFormFor(null); setFormFinding(''); setFormAction(''); setFormEstRecovery('') }}
                    className="text-xs text-[#94A3B8] px-3 py-1.5 rounded hover:text-[#F1F5F9]">取消</button>
                  <button onClick={() => handleCreateWorkOrder(showFormFor)}
                    className="flex items-center gap-1 text-xs bg-[#F97316] text-white px-4 py-1.5 rounded hover:bg-[#EA580C]">
                    <Send className="w-3 h-3" />提交工单
                  </button>
                </div>
              </div>
            )}
          </div>

          {Array.from(selected).map((sid) => {
            const wos = stationWorkOrders(sid)
            if (wos.length === 0) return null
            const station = allStations.find((s) => s.stationId === sid)
            return (
              <div key={`wo-${sid}`} className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-4 h-4 text-[#F97316]" />
                  <span className="text-xs text-[#94A3B8]">{station?.stationName} — 处置工单</span>
                  <span className="text-[10px] text-[#64748B] ml-auto">{wos.length} 条</span>
                </div>
                <div className="space-y-3">
                  {wos.map((wo) => (
                    <div key={wo.id} className="bg-[#0F172A]/60 border border-[#334155] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${WO_STATUS[wo.status].bg}`} style={{ color: WO_STATUS[wo.status].color }}>
                          {WO_STATUS[wo.status].label}
                        </span>
                        <span className="text-[10px] font-mono text-[#64748B]">{wo.createdAt}</span>
                        <span className="text-[10px] text-[#94A3B8]">|</span>
                        <span className="text-[10px] text-[#F97316]">{wo.assignee}</span>
                        {wo.status !== 'recovered' && (
                          <button onClick={() => updateWorkOrderStatus(wo.id, NEXT_STATUS[wo.status])}
                            className="ml-auto text-[10px] text-[#3B82F6] hover:text-[#60A5FA] flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            推进到{WO_STATUS[NEXT_STATUS[wo.status]].label}
                          </button>
                        )}
                        {wo.status === 'recovered' && <CheckCircle2 className="w-3 h-3 text-[#22C55E] ml-auto" />}
                      </div>
                      {wo.finding && <div className="text-xs text-[#CBD5E1]"><span className="text-[#64748B]">排查：</span>{wo.finding}</div>}
                      {wo.action && <div className="text-xs text-[#CBD5E1]"><span className="text-[#64748B]">措施：</span>{wo.action}</div>}
                      {wo.estimatedRecovery && <div className="text-xs text-[#CBD5E1]"><span className="text-[#64748B]">预计恢复：</span>{wo.estimatedRecovery}</div>}
                      {wo.progress.length > 0 && (
                        <div className="mt-2 border-t border-[#334155]/50 pt-2 space-y-1">
                          {wo.progress.map((p) => (
                            <div key={p.id} className="text-[10px] text-[#94A3B8]">
                              <span className="font-mono text-[#64748B]">{p.timestamp.slice(5, 16)}</span>{' '}
                              <span className="text-[#3B82F6]">{p.operator}</span>：{p.content}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          value={progressInput[wo.id] || ''}
                          onChange={(e) => setProgressInput({ ...progressInput, [wo.id]: e.target.value })}
                          placeholder="补充处理进展..."
                          className="flex-1 text-[10px] bg-[#1E293B] border border-[#334155] rounded px-2 py-1 text-white placeholder-[#64748B] outline-none focus:border-[#3B82F6]"
                        />
                        <button
                          onClick={() => {
                            if (progressInput[wo.id]?.trim()) {
                              addWorkOrderProgress(wo.id, progressInput[wo.id].trim())
                              setProgressInput({ ...progressInput, [wo.id]: '' })
                            }
                          }}
                          className="text-[10px] text-[#3B82F6] hover:text-[#60A5FA] flex items-center gap-0.5">
                          <Plus className="w-3 h-3" />补充
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ThermometerSun size={16} className="text-[#F97316]" />
              <span className="text-xs text-[#94A3B8]">7日供回水温度趋势</span>
              {selected.size === 0 && <span className="text-[10px] text-[#94A3B8] ml-2">点击上方表格行选择站点</span>}
            </div>
            {trendOption ? (
              <ReactECharts option={trendOption} style={{ height: 280 }} />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-[#94A3B8] text-xs">请在上方列表中选择站点查看温度趋势</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
