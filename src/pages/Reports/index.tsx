import { useState, useMemo, useEffect, useCallback } from 'react'
import ReactECharts from 'echarts-for-react'
import { FileText, Download, Calendar, TrendingUp, Target, Lightbulb, BarChart3, PieChart, X, ChevronRight, Wrench, AlertTriangle, ThermometerSun, Gauge } from 'lucide-react'
import { generateReportForRegion, getAnomalyStationsForRegion, getStationsForCity, getTempHistoryForStation, allRegionsCityMap } from '@/data/mockData'
import type { AnomalyStation } from '@/data/mockData'
import { useAppStore, filterCitiesByRole } from '@/store'

const allRegions = [
  { name: '全国', cityId: '' },
  { name: '北京', cityId: 'beijing' },
  { name: '天津', cityId: 'tianjin' },
  { name: '唐山', cityId: 'tangshan' },
  { name: '石家庄', cityId: 'shijiazhuang' },
  { name: '太原', cityId: 'taiyuan' },
  { name: '哈尔滨', cityId: 'harbin' },
  { name: '长春', cityId: 'changchun' },
  { name: '沈阳', cityId: 'shenyang' },
  { name: '呼和浩特', cityId: 'huhehaote' },
  { name: '乌鲁木齐', cityId: 'urumqi' },
  { name: '济南', cityId: 'jinan' },
  { name: '郑州', cityId: 'zhengzhou' },
  { name: '西安', cityId: 'xian' },
  { name: '兰州', cityId: 'lanzhou' },
  { name: '西宁', cityId: 'xining' },
  { name: '银川', cityId: 'yinchuan' },
  { name: '大连', cityId: 'dalian' },
  { name: '齐齐哈尔', cityId: 'qiqihaer' },
  { name: '吉林', cityId: 'jilin' },
  { name: '包头', cityId: 'baotou' },
]
const weeks = ['2026年第23周 (6.1-6.7)', '2026年第22周 (5.25-5.31)', '2026年第21周 (5.18-5.24)']

const recommendations = [
  { title: '管网水力平衡优化', desc: '建议对丰台区、城关区管网进行水力平衡调节，预计可降低热损耗率1.2%', icon: Target, color: '#F97316' },
  { title: '入户调节策略', desc: '建议对海淀区清河片区实施入户阀门智能调节，预计提升达标率3.5%', icon: TrendingUp, color: '#3B82F6' },
  { title: '锅炉运行优化', desc: '建议在非高峰时段减少1台锅炉运行，预计节约能耗成本8.5%', icon: Lightbulb, color: '#22C55E' },
]

export default function Reports() {
  const currentUser = useAppStore((s) => s.currentUser)
  const alerts = useAppStore((s) => s.alerts)
  const workOrders = useAppStore((s) => s.workOrders)

  const [reportData, setReportData] = useState(() => generateReportForRegion('全国'))
  const [generatedAt, setGeneratedAt] = useState<string>('')
  const [week, setWeek] = useState(weeks[0])
  const [region, setRegion] = useState('全国')
  const [isPreview, setIsPreview] = useState(true)
  const [drilldown, setDrilldown] = useState<{ metric: 'compliance' | 'heatLoss'; stations: AnomalyStation[] } | null>(null)
  const [expandedStation, setExpandedStation] = useState<string | null>(null)

  const visibleRegions = useMemo(() => {
    if (!currentUser) return allRegions.map((r) => r.name)
    if (currentUser.role === 'headquarters') return allRegions.map((r) => r.name)
    const cityRegions = allRegions.filter((r) => r.cityId !== '')
    const filtered = filterCitiesByRole(cityRegions, currentUser.role)
    return filtered.map((r: { name: string }) => r.name)
  }, [currentUser])

  const safeRegion = visibleRegions.includes(region) ? region : visibleRegions[0] || '北京'

  const handleGenerate = useCallback(() => {
    const data = generateReportForRegion(safeRegion, week)
    setReportData(data)
    setGeneratedAt(new Date().toLocaleString('zh-CN'))
    setIsPreview(false)
  }, [safeRegion, week])

  useEffect(() => {
    const data = generateReportForRegion(safeRegion, week)
    setReportData(data)
    setIsPreview(true)
    setDrilldown(null)
    setExpandedStation(null)
  }, [safeRegion, week])

  const report = reportData.report
  const complianceTrend = reportData.complianceTrend
  const heatLoss = reportData.heatLoss
  const energyCost = reportData.energyCost

  const complianceOption = useMemo(() => ({
    tooltip: { trigger: 'axis' as const, formatter: (params: any) => params.map((p: any) => `${p.seriesName}: ${p.value}%`).join('<br/>') },
    legend: { data: ['本年度', '上年度'], top: 0, textStyle: { color: '#94A3B8', fontSize: 12 } },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category' as const, data: complianceTrend.map(d => d.month), axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94A3B8' } },
    yAxis: { type: 'value' as const, min: 88, axisLine: { show: false }, splitLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94A3B8', formatter: '{value}%' } },
    series: [
      { name: '本年度', type: 'line', smooth: true, data: complianceTrend.map(d => d.currentYear), itemStyle: { color: '#F97316' }, lineStyle: { width: 2 } },
      { name: '上年度', type: 'line', smooth: true, data: complianceTrend.map(d => d.lastYear), itemStyle: { color: '#3B82F6' }, lineStyle: { width: 2 } },
    ],
  }), [complianceTrend])

  const heatLossOption = useMemo(() => ({
    tooltip: { trigger: 'item' as const, formatter: '{b}: {c}%' },
    color: ['#F97316', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#64748B'],
    graphic: [{ type: 'text' as const, left: 'center', top: 'middle', style: { text: '热损耗原因', fill: '#94A3B8', fontSize: 13 } }],
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '50%'],
      label: { color: '#94A3B8', formatter: '{b} {d}%' },
      data: heatLoss.map(d => ({ name: d.reason, value: d.percentage })),
    }],
  }), [heatLoss])

  const energyCostOption = useMemo(() => ({
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['总费用', '单位面积费用'], top: 0, textStyle: { color: '#94A3B8', fontSize: 12 } },
    grid: { left: 50, right: 50, top: 40, bottom: 30 },
    xAxis: { type: 'category' as const, data: energyCost.map(d => d.month), axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94A3B8' } },
    yAxis: [
      { type: 'value' as const, name: '万元', axisLine: { show: false }, splitLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94A3B8' }, nameTextStyle: { color: '#94A3B8' } },
      { type: 'value' as const, name: '元/m²', axisLine: { show: false }, splitLine: { show: false }, axisLabel: { color: '#94A3B8' }, nameTextStyle: { color: '#94A3B8' } },
    ],
    series: [
      { name: '总费用', type: 'bar', data: energyCost.map(d => d.cost), itemStyle: { color: '#F97316', borderRadius: [4, 4, 0, 0] }, barWidth: 24 },
      { name: '单位面积费用', type: 'line', yAxisIndex: 1, smooth: true, data: energyCost.map(d => d.unitAreaCost), itemStyle: { color: '#3B82F6' }, lineStyle: { width: 2 } },
    ],
  }), [energyCost])

  const summaryCards = [
    { label: '室温达标率', value: `${report.complianceRate}%`, sub: `同比 +${report.complianceYoY}%  环比 ${report.complianceMoM}%`, icon: Target, accent: '#F97316', drillable: true },
    { label: '热损耗率', value: `${report.heatLossRate}%`, sub: '较上期下降0.3%', icon: TrendingUp, accent: '#3B82F6', drillable: true },
    { label: '能耗成本', value: `${report.energyCost}万元`, sub: `同比 ${report.energyCostYoY}%`, icon: BarChart3, accent: '#22C55E', drillable: false },
    { label: '投诉处理', value: `${report.resolvedComplaints}/${report.totalComplaints}`, sub: `解决率 ${((report.resolvedComplaints / report.totalComplaints) * 100).toFixed(1)}%`, icon: PieChart, accent: '#F59E0B', drillable: false },
  ]

  const getStationTempHistory = (stationId: string) => {
    const cityId = allRegionsCityMap[safeRegion] || 'beijing'
    const stations = getStationsForCity(cityId)
    const station = stations.find(s => s.stationId === stationId)
    if (!station) return []
    return getTempHistoryForStation(station)
  }

  const getRelatedAlerts = (stationName: string) => {
    return alerts.filter(a => a.stationName === stationName)
  }

  const getRelatedWorkOrders = (stationId: string) => {
    return workOrders.filter(wo => wo.stationId === stationId)
  }

  const generateMockPressure = () => {
    const days = 7
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      data.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        supply: +(0.45 + Math.random() * 0.15).toFixed(2),
        return_: +(0.25 + Math.random() * 0.1).toFixed(2),
      })
    }
    return data
  }

  return (
    <div className="bg-[#0F172A] min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-[#F97316]" />
          <h1 className="text-xl font-bold text-white">运行诊断报告</h1>
          <span className="text-xs text-[#94A3B8]">{report.weekStart} ~ {report.weekEnd} · {safeRegion}</span>
          {isPreview && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">预览口径</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-[#94A3B8]" />
            <select value={week} onChange={e => setWeek(e.target.value)} className="bg-transparent text-sm text-[#94A3B8] outline-none cursor-pointer">
              {weeks.map(w => <option key={w} value={w} className="bg-[#1E293B]">{w}</option>)}
            </select>
          </div>
          <select value={region} onChange={e => setRegion(e.target.value)} className="bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#94A3B8] outline-none cursor-pointer">
            {visibleRegions.map(r => <option key={r} value={r} className="bg-[#1E293B]">{r}</option>)}
          </select>
          <button onClick={handleGenerate} className="flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />生成正式报告
          </button>
        </div>
      </div>

      <div className="text-xs text-[#94A3B8]">
        报告口径: {safeRegion} | {isPreview ? '预览数据 — 点击"生成正式报告"确认' : `正式报告 · 生成时间: ${generatedAt}`}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <div key={c.label}
            onClick={() => {
              if (c.drillable) {
                const metric = c.label === '室温达标率' ? 'compliance' : 'heatLoss' as 'compliance' | 'heatLoss'
                setDrilldown({ metric, stations: getAnomalyStationsForRegion(safeRegion, metric) })
                setExpandedStation(null)
              }
            }}
            className={`bg-[#1E293B] border border-[#334155] rounded-xl p-4 ${c.drillable ? 'cursor-pointer hover:border-[#F97316]/50 transition-colors' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <c.icon className="w-4 h-4" style={{ color: c.accent }} />
              <span className="text-xs text-[#94A3B8]">{c.label}</span>
              {c.drillable && <span className="text-[8px] text-[#64748B] ml-auto">点击下钻</span>}
            </div>
            <div className="font-mono text-2xl font-bold text-white mb-1">{c.value}</div>
            <div className="text-xs text-[#94A3B8]">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">室温达标率趋势</h2>
          <ReactECharts option={complianceOption} style={{ height: 280 }} />
        </div>
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">热损耗原因分布</h2>
          <ReactECharts option={heatLossOption} style={{ height: 280 }} />
        </div>
      </div>

      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white mb-3">能耗成本分析</h2>
        <ReactECharts option={energyCostOption} style={{ height: 280 }} />
      </div>

      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white mb-4">优化建议</h2>
        <div className="grid grid-cols-3 gap-4">
          {recommendations.map(r => (
            <div key={r.title} className="border border-[#334155] rounded-lg p-4 hover:border-[#F97316]/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <r.icon className="w-5 h-5" style={{ color: r.color }} />
                <span className="text-sm font-semibold text-white">{r.title}</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {drilldown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setDrilldown(null); setExpandedStation(null) }}>
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl w-[780px] max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#334155] sticky top-0 bg-[#1E293B] z-10">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {drilldown.metric === 'compliance' ? '室温达标率异常站点' : '热损耗率异常站点'}
                </h3>
                <span className="text-[10px] text-[#94A3B8]">口径: {safeRegion} · 点击站点行查看详情</span>
              </div>
              <button onClick={() => { setDrilldown(null); setExpandedStation(null) }} className="text-[#64748B] hover:text-[#F1F5F9]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              {drilldown.stations.length === 0 ? (
                <div className="text-center text-sm text-[#64748B] py-8">当前范围无异常站点</div>
              ) : (
                <div className="space-y-1">
                  {drilldown.stations.map((s) => {
                    const isExpanded = expandedStation === s.stationId
                    const relatedAlerts = getRelatedAlerts(s.stationName)
                    const relatedWOs = getRelatedWorkOrders(s.stationId)
                    const tempHistory = isExpanded ? getStationTempHistory(s.stationId) : []
                    const pressureData = isExpanded ? generateMockPressure() : []

                    const tempOption = tempHistory.length > 0 ? {
                      tooltip: { trigger: 'axis' as const },
                      legend: { data: ['供水温度', '回水温度'], textStyle: { color: '#94A3B8', fontSize: 10 } },
                      grid: { left: 35, right: 15, top: 30, bottom: 25 },
                      xAxis: { type: 'category' as const, data: tempHistory.map(p => p.time), axisLabel: { color: '#94A3B8', fontSize: 9 } },
                      yAxis: { type: 'value' as const, name: '°C', axisLabel: { color: '#94A3B8', fontSize: 9 }, nameTextStyle: { color: '#94A3B8' } },
                      series: [
                        { name: '供水温度', type: 'line', smooth: true, data: tempHistory.map(p => p.supplyTemp), lineStyle: { color: '#F97316' }, itemStyle: { color: '#F97316' }, symbol: 'none' },
                        { name: '回水温度', type: 'line', smooth: true, data: tempHistory.map(p => p.returnTemp), lineStyle: { color: '#3B82F6' }, itemStyle: { color: '#3B82F6' }, symbol: 'none' },
                      ],
                    } : null

                    const pressureOption = pressureData.length > 0 ? {
                      tooltip: { trigger: 'axis' as const },
                      legend: { data: ['供水压力', '回水压力'], textStyle: { color: '#94A3B8', fontSize: 10 } },
                      grid: { left: 35, right: 15, top: 30, bottom: 25 },
                      xAxis: { type: 'category' as const, data: pressureData.map(p => p.date), axisLabel: { color: '#94A3B8', fontSize: 9 } },
                      yAxis: { type: 'value' as const, name: 'MPa', axisLabel: { color: '#94A3B8', fontSize: 9 }, nameTextStyle: { color: '#94A3B8' } },
                      series: [
                        { name: '供水压力', type: 'bar', data: pressureData.map(p => p.supply), itemStyle: { color: '#F97316' } },
                        { name: '回水压力', type: 'bar', data: pressureData.map(p => p.return_), itemStyle: { color: '#3B82F6' } },
                      ],
                    } : null

                    return (
                      <div key={s.stationId} className="border border-[#334155] rounded-lg overflow-hidden">
                        <div
                          onClick={() => setExpandedStation(isExpanded ? null : s.stationId)}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#334155]/30"
                        >
                          <ChevronRight className={`w-3 h-3 text-[#94A3B8] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          <span className="text-xs text-white flex-1">{s.stationName}</span>
                          <span className="text-[10px] text-[#94A3B8]">{s.districtName}</span>
                          <span className={`font-mono text-[10px] ${s.complianceRate < 90 ? 'text-[#EF4444]' : s.complianceRate < 93 ? 'text-[#F59E0B]' : 'text-white'}`}>
                            达标{s.complianceRate}%
                          </span>
                          <span className={`font-mono text-[10px] ${s.heatLossRate > 10 ? 'text-[#EF4444]' : s.heatLossRate > 7 ? 'text-[#F59E0B]' : 'text-white'}`}>
                            热损{s.heatLossRate}%
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] ${s.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {s.status === 'error' ? '故障' : '预警'}
                          </span>
                          {relatedAlerts.length > 0 && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-[#F97316]/10 text-[#F97316]">
                              <AlertTriangle className="w-2.5 h-2.5 inline" /> {relatedAlerts.length}
                            </span>
                          )}
                          {relatedWOs.length > 0 && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6]">
                              <Wrench className="w-2.5 h-2.5 inline" /> {relatedWOs.length}
                            </span>
                          )}
                        </div>
                        {isExpanded && (
                          <div className="border-t border-[#334155] p-3 bg-[#0F172A]/40 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <ThermometerSun className="w-3 h-3 text-[#F97316]" />
                                  <span className="text-[10px] text-[#94A3B8]">近7日温度趋势</span>
                                </div>
                                {tempOption ? (
                                  <ReactECharts option={tempOption} style={{ height: 160 }} />
                                ) : (
                                  <div className="h-[160px] flex items-center justify-center text-[#64748B] text-[10px]">暂无数据</div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <Gauge className="w-3 h-3 text-[#3B82F6]" />
                                  <span className="text-[10px] text-[#94A3B8]">近7日压力趋势</span>
                                </div>
                                {pressureOption ? (
                                  <ReactECharts option={pressureOption} style={{ height: 160 }} />
                                ) : (
                                  <div className="h-[160px] flex items-center justify-center text-[#64748B] text-[10px]">暂无数据</div>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-[#1E293B] rounded-lg p-2 text-center">
                                <div className="text-[10px] text-[#94A3B8]">室温达标率</div>
                                <div className={`text-sm font-mono font-bold ${s.complianceRate < 90 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>{s.complianceRate}%</div>
                              </div>
                              <div className="bg-[#1E293B] rounded-lg p-2 text-center">
                                <div className="text-[10px] text-[#94A3B8]">关联预警</div>
                                <div className="text-sm font-mono font-bold text-[#F97316]">{relatedAlerts.length} 条</div>
                              </div>
                              <div className="bg-[#1E293B] rounded-lg p-2 text-center">
                                <div className="text-[10px] text-[#94A3B8]">处置工单</div>
                                <div className="text-sm font-mono font-bold text-[#3B82F6]">{relatedWOs.length} 条</div>
                              </div>
                            </div>
                            {relatedAlerts.length > 0 && (
                              <div>
                                <div className="text-[10px] text-[#94A3B8] mb-1 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-[#F97316]" /> 关联预警
                                </div>
                                <div className="space-y-1">
                                  {relatedAlerts.slice(0, 3).map(a => (
                                    <div key={a.alertId} className="flex items-center gap-2 bg-[#1E293B] rounded px-2 py-1">
                                      <span className={`w-1.5 h-1.5 rounded-full ${a.level === 1 ? 'bg-[#F59E0B]' : a.level === 2 ? 'bg-[#F97316]' : 'bg-[#EF4444]'}`} />
                                      <span className="text-[10px] text-[#CBD5E1] flex-1">{a.description}</span>
                                      <span className={`text-[9px] px-1 py-0.5 rounded ${a.status === 'pending' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : a.status === 'resolved' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#3B82F6]/10 text-[#3B82F6]'}`}>
                                        {a.status === 'pending' ? '待处理' : a.status === 'confirmed' ? '已确认' : a.status === 'reviewed' ? '已复核' : a.status === 'approved' ? '已批准' : '已解决'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {relatedWOs.length > 0 && (
                              <div>
                                <div className="text-[10px] text-[#94A3B8] mb-1 flex items-center gap-1">
                                  <Wrench className="w-3 h-3 text-[#3B82F6]" /> 处置工单
                                </div>
                                <div className="space-y-1">
                                  {relatedWOs.map(wo => (
                                    <div key={wo.id} className="flex items-center gap-2 bg-[#1E293B] rounded px-2 py-1">
                                      <span className={`text-[9px] px-1 py-0.5 rounded ${
                                        wo.status === 'pending_inspect' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                                        wo.status === 'in_progress' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' :
                                        wo.status === 'pending_review' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' :
                                        'bg-[#22C55E]/10 text-[#22C55E]'
                                      }`}>
                                        {wo.status === 'pending_inspect' ? '待排查' : wo.status === 'in_progress' ? '处理中' : wo.status === 'pending_review' ? '待复核' : '已恢复'}
                                      </span>
                                      <span className="text-[10px] text-[#CBD5E1] flex-1">{wo.finding || wo.action || '暂无描述'}</span>
                                      <span className="text-[9px] text-[#64748B]">{wo.assignee}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {relatedAlerts.length === 0 && relatedWOs.length === 0 && (
                              <div className="text-center text-[10px] text-[#64748B] py-2">暂无关联预警和处置工单</div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
