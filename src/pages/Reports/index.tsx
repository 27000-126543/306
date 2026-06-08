import { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { FileText, Download, Calendar, TrendingUp, Target, Lightbulb, BarChart3, PieChart, X } from 'lucide-react'
import { generateReportForRegion, getAnomalyStationsForRegion } from '@/data/mockData'
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
  const [reportData, setReportData] = useState(() => generateReportForRegion('全国'))
  const [generatedAt, setGeneratedAt] = useState<string>('')
  const [week, setWeek] = useState(weeks[0])
  const [region, setRegion] = useState('全国')
  const [drilldown, setDrilldown] = useState<{ metric: 'compliance' | 'heatLoss'; stations: AnomalyStation[] } | null>(null)

  const visibleRegions = useMemo(() => {
    if (!currentUser) return allRegions.map((r) => r.name)
    if (currentUser.role === 'headquarters') return allRegions.map((r) => r.name)
    const cityRegions = allRegions.filter((r) => r.cityId !== '')
    const filtered = filterCitiesByRole(cityRegions, currentUser.role)
    return filtered.map((r: { name: string }) => r.name)
  }, [currentUser])

  const safeRegion = visibleRegions.includes(region) ? region : visibleRegions[0] || '北京'

  const handleGenerate = () => {
    const data = generateReportForRegion(safeRegion, week)
    setReportData(data)
    setGeneratedAt(new Date().toLocaleString('zh-CN'))
  }

  const report = reportData.report
  const complianceTrend = reportData.complianceTrend
  const heatLoss = reportData.heatLoss
  const energyCost = reportData.energyCost

  const complianceOption = {
    tooltip: { trigger: 'axis', formatter: (params: any) => params.map((p: any) => `${p.seriesName}: ${p.value}%`).join('<br/>') },
    legend: { data: ['本年度', '上年度'], top: 0, textStyle: { color: '#94A3B8', fontSize: 12 } },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: complianceTrend.map(d => d.month), axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94A3B8' } },
    yAxis: { type: 'value', min: 88, axisLine: { show: false }, splitLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94A3B8', formatter: '{value}%' } },
    series: [
      { name: '本年度', type: 'line', smooth: true, data: complianceTrend.map(d => d.currentYear), itemStyle: { color: '#F97316' }, lineStyle: { width: 2 } },
      { name: '上年度', type: 'line', smooth: true, data: complianceTrend.map(d => d.lastYear), itemStyle: { color: '#3B82F6' }, lineStyle: { width: 2 } },
    ],
  }

  const heatLossOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    color: ['#F97316', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#64748B'],
    graphic: [{ type: 'text', left: 'center', top: 'middle', style: { text: '热损耗原因', fill: '#94A3B8', fontSize: 13 } }],
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '50%'],
      label: { color: '#94A3B8', formatter: '{b} {d}%' },
      data: heatLoss.map(d => ({ name: d.reason, value: d.percentage })),
    }],
  }

  const energyCostOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['总费用', '单位面积费用'], top: 0, textStyle: { color: '#94A3B8', fontSize: 12 } },
    grid: { left: 50, right: 50, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: energyCost.map(d => d.month), axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94A3B8' } },
    yAxis: [
      { type: 'value', name: '万元', axisLine: { show: false }, splitLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94A3B8' }, nameTextStyle: { color: '#94A3B8' } },
      { type: 'value', name: '元/m²', axisLine: { show: false }, splitLine: { show: false }, axisLabel: { color: '#94A3B8' }, nameTextStyle: { color: '#94A3B8' } },
    ],
    series: [
      { name: '总费用', type: 'bar', data: energyCost.map(d => d.cost), itemStyle: { color: '#F97316', borderRadius: [4, 4, 0, 0] }, barWidth: 24 },
      { name: '单位面积费用', type: 'line', yAxisIndex: 1, smooth: true, data: energyCost.map(d => d.unitAreaCost), itemStyle: { color: '#3B82F6' }, lineStyle: { width: 2 } },
    ],
  }

  const summaryCards = [
    { label: '室温达标率', value: `${report.complianceRate}%`, sub: `同比 +${report.complianceYoY}%  环比 ${report.complianceMoM}%`, icon: Target, accent: '#F97316' },
    { label: '热损耗率', value: `${report.heatLossRate}%`, sub: '较上期下降0.3%', icon: TrendingUp, accent: '#3B82F6' },
    { label: '能耗成本', value: `${report.energyCost}万元`, sub: `同比 ${report.energyCostYoY}%`, icon: BarChart3, accent: '#22C55E' },
    { label: '投诉处理', value: `${report.resolvedComplaints}/${report.totalComplaints}`, sub: `解决率 ${((report.resolvedComplaints / report.totalComplaints) * 100).toFixed(1)}%`, icon: PieChart, accent: '#F59E0B' },
  ]

  return (
    <div className="bg-[#0F172A] min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-[#F97316]" />
          <h1 className="text-xl font-bold text-white">运行诊断报告</h1>
          <span className="text-xs text-[#94A3B8]">{report.weekStart} ~ {report.weekEnd} · {safeRegion}</span>
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
            <Download className="w-4 h-4" />生成报告
          </button>
        </div>
      </div>

      <div className="text-xs text-[#94A3B8]">
        报告口径: {safeRegion} | 生成时间: {generatedAt || '尚未生成'}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <div key={c.label}
            onClick={() => {
              if (c.label === '室温达标率') setDrilldown({ metric: 'compliance', stations: getAnomalyStationsForRegion(safeRegion, 'compliance') })
              else if (c.label === '热损耗率') setDrilldown({ metric: 'heatLoss', stations: getAnomalyStationsForRegion(safeRegion, 'heatLoss') })
            }}
            className={`bg-[#1E293B] border border-[#334155] rounded-xl p-4 ${(c.label === '室温达标率' || c.label === '热损耗率') ? 'cursor-pointer hover:border-[#F97316]/50 transition-colors' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <c.icon className="w-4 h-4" style={{ color: c.accent }} />
              <span className="text-xs text-[#94A3B8]">{c.label}</span>
              {(c.label === '室温达标率' || c.label === '热损耗率') && <span className="text-[8px] text-[#64748B] ml-auto">点击下钻</span>}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDrilldown(null)}>
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl w-[640px] max-h-[70vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#334155]">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {drilldown.metric === 'compliance' ? '室温达标率异常站点' : '热损耗率异常站点'}
                </h3>
                <span className="text-[10px] text-[#94A3B8]">口径: {safeRegion}</span>
              </div>
              <button onClick={() => setDrilldown(null)} className="text-[#64748B] hover:text-[#F1F5F9]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              {drilldown.stations.length === 0 ? (
                <div className="text-center text-sm text-[#64748B] py-8">当前范围无异常站点</div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[#94A3B8] border-b border-[#334155]">
                      <th className="py-2 px-3 text-left font-normal">站名</th>
                      <th className="py-2 px-3 text-left font-normal">区县</th>
                      <th className="py-2 px-3 text-right font-normal">达标率%</th>
                      <th className="py-2 px-3 text-right font-normal">热损率%</th>
                      <th className="py-2 px-3 text-center font-normal">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drilldown.stations.map((s) => (
                      <tr key={s.stationId} className="border-b border-[#334155]/50">
                        <td className="py-2 px-3 text-white">{s.stationName}</td>
                        <td className="py-2 px-3 text-[#94A3B8]">{s.districtName}</td>
                        <td className="py-2 px-3 text-right font-mono">
                          <span className={s.complianceRate < 90 ? 'text-[#EF4444]' : s.complianceRate < 93 ? 'text-[#F59E0B]' : 'text-white'}>
                            {s.complianceRate}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          <span className={s.heatLossRate > 10 ? 'text-[#EF4444]' : s.heatLossRate > 7 ? 'text-[#F59E0B]' : 'text-white'}>
                            {s.heatLossRate}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${s.status === 'error' ? 'bg-red-500/20 text-red-400' : s.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                            {s.status === 'error' ? '故障' : s.status === 'warning' ? '预警' : '正常'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
