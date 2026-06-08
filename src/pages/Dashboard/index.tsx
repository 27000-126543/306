import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { Flame, Activity, TrendingDown, ThermometerSun, AlertTriangle } from 'lucide-react'
import KPICard from '@/components/KPICard/KPICard'
import { cityHeatData } from '@/data/mockData'
import { useAppStore, filterCitiesByRole } from '@/store'

const qualityColors: Record<string, string> = {
  excellent: '#22C55E',
  good: '#3B82F6',
  medium: '#F59E0B',
  poor: '#EF4444',
}

const qualityLabels: Record<string, string> = {
  excellent: '优秀',
  good: '良好',
  medium: '中等',
  poor: '较差',
}

const LNG_MIN = 73
const LNG_MAX = 136
const LAT_MIN = 18
const LAT_MAX = 54

function lngLatToPosition(lng: number, lat: number) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100
  return { x, y }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)

  const currentUser = useAppStore((s) => s.currentUser)
  const alerts = useAppStore((s) => s.alerts)

  const visibleCities = useMemo(
    () => filterCitiesByRole(cityHeatData, currentUser?.role || 'headquarters'),
    [currentUser?.role]
  )

  const ranking = useMemo(
    () =>
      visibleCities
        .map((c) => ({ cityName: c.cityName, complaintRate: c.complaintRate }))
        .sort((a, b) => b.complaintRate - a.complaintRate)
        .slice(0, 10),
    [visibleCities]
  )

  const kpiValues = useMemo(() => {
    if (visibleCities.length === 0) {
      return { totalHeatLoad: 0, avgEfficiency: 0, heatLossRate: 0, avgCompliance: 0 }
    }
    const totalHeatLoad = visibleCities.reduce((sum, c) => sum + c.heatLoad, 0)
    const avgCompliance = visibleCities.reduce((sum, c) => sum + c.complianceRate, 0) / visibleCities.length
    const avgComplaint = visibleCities.reduce((sum, c) => sum + c.complaintRate, 0) / visibleCities.length
    const avgEfficiency = Math.max(0, avgCompliance - 5.2)
    const heatLossRate = 7.5 + avgComplaint * 0.3
    return { totalHeatLoad, avgEfficiency, heatLossRate, avgCompliance }
  }, [visibleCities])

  const level1Count = alerts.filter((a) => a.level === 1).length
  const level2Count = alerts.filter((a) => a.level === 2).length
  const level3Count = alerts.filter((a) => a.level === 3).length

  const complaintChartOption = {
    grid: { left: 80, right: 30, top: 10, bottom: 20 },
    xAxis: {
      type: 'value' as const,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#1E293B' } },
      axisLabel: { color: '#94A3B8', fontSize: 11, formatter: '{value}%' },
    },
    yAxis: {
      type: 'category' as const,
      data: ranking.map((c) => c.cityName).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94A3B8', fontSize: 12 },
    },
    series: [
      {
        type: 'bar' as const,
        data: ranking.map((c) => c.complaintRate).reverse(),
        barWidth: 14,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#F97316' },
              { offset: 1, color: '#EF4444' },
            ],
          },
        },
      },
    ],
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#F1F5F9', fontSize: 12 },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        return `${p.name}<br/>投诉率: <b class="font-mono">${p.value}%</b>`
      },
    },
    backgroundColor: 'transparent',
  }

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="总热负荷"
          value={kpiValues.totalHeatLoad.toLocaleString()}
          unit="MW"
          change={2.3}
          icon={<Flame className="w-5 h-5 text-[#F97316]" />}
          color="orange"
          delay="stagger-1"
        />
        <KPICard
          title="平均供热效率"
          value={kpiValues.avgEfficiency.toFixed(1)}
          unit="%"
          change={1.2}
          icon={<Activity className="w-5 h-5 text-[#3B82F6]" />}
          color="blue"
          delay="stagger-2"
        />
        <KPICard
          title="热损率"
          value={kpiValues.heatLossRate.toFixed(1)}
          unit="%"
          change={-0.8}
          icon={<TrendingDown className="w-5 h-5 text-[#22C55E]" />}
          color="green"
          delay="stagger-3"
        />
        <KPICard
          title="室温达标率"
          value={kpiValues.avgCompliance.toFixed(1)}
          unit="%"
          change={0.5}
          icon={<ThermometerSun className="w-5 h-5 text-[#F97316]" />}
          color="orange"
          delay="stagger-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card opacity-0 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[#F1F5F9]">全国供暖质量热力图</h3>
            <div className="flex items-center gap-4 text-[10px] text-[#94A3B8]">
              {Object.entries(qualityLabels).map(([key, label]) => (
                <span key={key} className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: qualityColors[key] }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="relative w-full" style={{ paddingBottom: '60%' }}>
            <div className="absolute inset-0 rounded-lg overflow-hidden bg-[#0F172A]/60 border border-[#1E293B]">
              {visibleCities.map((city) => {
                const pos = lngLatToPosition(city.lng, city.lat)
                const color = qualityColors[city.qualityLevel]
                const isHovered = hoveredCity === city.cityId
                return (
                  <div
                    key={city.cityId}
                    className="absolute cursor-pointer group"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                    onMouseEnter={() => setHoveredCity(city.cityId)}
                    onMouseLeave={() => setHoveredCity(null)}
                    onClick={() => navigate(`/dashboard/${city.cityId}`)}
                  >
                    <span
                      className={`block rounded-full transition-all duration-300 ${isHovered ? 'scale-150' : ''}`}
                      style={{
                        width: isHovered ? 14 : 8,
                        height: isHovered ? 14 : 8,
                        backgroundColor: color,
                        boxShadow: isHovered ? `0 0 12px ${color}` : `0 0 6px ${color}80`,
                      }}
                    />
                    <span
                      className="absolute left-1/2 -translate-x-1/2 mt-1 text-[10px] whitespace-nowrap pointer-events-none"
                      style={{ color: isHovered ? '#F1F5F9' : '#94A3B8' }}
                    >
                      {city.cityName}
                    </span>
                    {isHovered && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-[#1E293B] border border-[#334155] rounded-lg p-3 min-w-[180px] z-50 shadow-xl pointer-events-none">
                        <div className="text-xs font-medium text-[#F1F5F9] mb-2">{city.cityName}</div>
                        <div className="space-y-1 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-[#94A3B8]">达标率</span>
                            <span className="font-mono text-[#F1F5F9]">{city.complianceRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#94A3B8]">投诉率</span>
                            <span className="font-mono text-[#F1F5F9]">{city.complaintRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#94A3B8]">热负荷</span>
                            <span className="font-mono text-[#F1F5F9]">{city.heatLoad} MW</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#94A3B8]">质量等级</span>
                            <span className="font-mono" style={{ color: qualityColors[city.qualityLevel] }}>
                              {qualityLabels[city.qualityLevel]}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="card opacity-0 animate-fade-in-up stagger-3">
          <h3 className="text-sm font-medium text-[#F1F5F9] mb-4">投诉率排名 TOP 10</h3>
          <ReactECharts option={complaintChartOption} style={{ height: '100%', minHeight: 360 }} />
        </div>
      </div>

      <div className="card opacity-0 animate-fade-in-up stagger-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[#F1F5F9]">预警概览</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#EF4444] animate-pulse" />
              <span className="text-[10px] text-[#94A3B8]">三级（严重）</span>
              <span className="text-sm font-bold font-mono text-[#EF4444]">{level3Count}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F97316] animate-pulse" />
              <span className="text-[10px] text-[#94A3B8]">二级（较重）</span>
              <span className="text-sm font-bold font-mono text-[#F97316]">{level2Count}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span className="text-[10px] text-[#94A3B8]">一级（一般）</span>
              <span className="text-sm font-bold font-mono text-[#F59E0B]">{level1Count}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {alerts.slice(0, 5).map((alert) => {
            const levelColor = alert.level === 3 ? '#EF4444' : alert.level === 2 ? '#F97316' : '#F59E0B'
            const levelBg = alert.level === 3 ? 'bg-[#EF4444]/10' : alert.level === 2 ? 'bg-[#F97316]/10' : 'bg-[#F59E0B]/10'
            return (
              <div
                key={alert.alertId}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#0F172A]/60 border border-[#334155] hover:border-[#475569] transition-colors cursor-pointer"
                onClick={() => navigate(`/dashboard/${alert.cityId}`)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${levelBg}`}>
                  <AlertTriangle className="w-4 h-4" style={{ color: levelColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{ backgroundColor: `${levelColor}20`, color: levelColor }}
                    >
                      {alert.level}级预警
                    </span>
                    <span className="text-xs text-[#F1F5F9] truncate">{alert.region} · {alert.stationName}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5 truncate">{alert.description}</p>
                </div>
                <span className="text-[10px] text-[#64748B] whitespace-nowrap">{alert.createdAt.slice(5, 16)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
