import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { ArrowLeft, Search, Filter, ThermometerSun, BarChart3 } from 'lucide-react'
import { cityHeatData, districtsData, heatStationsData, stationTempHistory, roomTempBoxPlot } from '@/data/mockData'

const statusMap: Record<string, { label: string; bg: string }> = {
  normal: { label: '正常', bg: 'bg-green-500/20 text-green-400' },
  warning: { label: '预警', bg: 'bg-yellow-500/20 text-yellow-400' },
  error: { label: '故障', bg: 'bg-red-500/20 text-red-400' },
}

export default function RegionDetail() {
  const { cityId } = useParams<{ cityId: string }>()
  const navigate = useNavigate()
  const id = cityId || 'beijing'
  const city = cityHeatData.find((c) => c.cityId === id) || cityHeatData.find((c) => c.cityId === 'beijing')!
  const districts = districtsData[id] || districtsData['beijing']
  const allStations = useMemo(() => {
    const keys = districts.map((d) => d.districtId)
    return keys.flatMap((k) => heatStationsData[k] || [])
  }, [districts])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

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

  const kpiOption = useMemo(() => ({
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['供热效率', '达标率', '热损耗率'], textStyle: { color: '#94A3B8' } },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category' as const, data: districts.map((d) => d.districtName), axisLabel: { color: '#94A3B8' } },
    yAxis: { type: 'value' as const, axisLabel: { color: '#94A3B8' } },
    series: [
      { name: '供热效率', type: 'bar', data: districts.map((d) => d.heatingEfficiency), itemStyle: { color: '#3B82F6' } },
      { name: '达标率', type: 'bar', data: districts.map((d) => d.complianceRate), itemStyle: { color: '#22C55E' } },
      { name: '热损耗率', type: 'bar', data: districts.map((d) => d.heatLossRate), itemStyle: { color: '#F97316' } },
    ],
  }), [districts])

  const trendOption = useMemo(() => {
    const sids = Array.from(selected)
    if (!sids.length) return null
    const dates = stationTempHistory[sids[0]]?.map((p) => p.time) || []
    const series = sids.flatMap((sid) => {
      const h = stationTempHistory[sid]
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
    const boxData = roomTempBoxPlot.map((d) => [d.min, d.q1, d.median, d.q3, d.max])
    const outliers = roomTempBoxPlot.flatMap((d, i) => d.outliers.map((o) => [i, o]))
    return {
      tooltip: { trigger: 'item' as const },
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category' as const, data: roomTempBoxPlot.map((d) => d.districtName), axisLabel: { color: '#94A3B8' } },
      yAxis: { type: 'value' as const, name: '°C', axisLabel: { color: '#94A3B8' } },
      series: [
        { type: 'boxplot', data: boxData, itemStyle: { color: '#3B82F6', borderColor: '#3B82F6' } },
        { type: 'scatter', data: outliers, symbolSize: 6, itemStyle: { color: '#F97316' } },
      ],
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-[#1E293B] border border-[#334155] hover:bg-[#334155]">
          <ArrowLeft size={18} className="text-[#94A3B8]" />
        </button>
        <h1 className="text-lg font-semibold text-white">{city.cityName} · 区域详情</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-[#3B82F6]" />
            <span className="text-xs text-[#94A3B8]">区县KPI对比</span>
          </div>
          <ReactECharts option={kpiOption} style={{ height: 260 }} />
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ThermometerSun size={16} className="text-[#F97316]" />
            <span className="text-xs text-[#94A3B8]">室温分布箱线图</span>
          </div>
          <ReactECharts option={boxPlotOption} style={{ height: 260 }} />
        </div>
      </div>

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
              {districts.map((d) => <option key={d.districtId} value={d.districtId}>{d.districtName}</option>)}
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  )
}
