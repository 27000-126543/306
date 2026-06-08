import { useState, useMemo, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { read } from 'xlsx'
import {
  Upload, Cloud, FileSpreadsheet, Zap, TrendingUp,
  CheckCircle, CloudSnow, Wind,
} from 'lucide-react'
import { generateDynamicForecast, computePeakShavingPlans } from '@/data/mockData'
import type { ForecastDataPoint } from '@/types'

export default function Forecast() {
  const [weatherFile, setWeatherFile] = useState<string | null>(null)
  const [weatherSummary, setWeatherSummary] = useState<{ tempRange: string; coldSnap: boolean } | null>(null)
  const [holidayPlan, setHolidayPlan] = useState<string>('')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const [forecastPoints, setForecastPoints] = useState<ForecastDataPoint[]>(generateDynamicForecast())
  const [parsedTemps, setParsedTemps] = useState<number[]>([])
  const [hasColdSnap, setHasColdSnap] = useState(false)
  const [holidayBoost, setHolidayBoost] = useState(0)

  useEffect(() => {
    const newForecast = generateDynamicForecast(
      parsedTemps.length > 0 ? parsedTemps : undefined,
      hasColdSnap,
      holidayBoost > 0 ? holidayBoost : undefined
    )
    setForecastPoints(newForecast)
  }, [parsedTemps, hasColdSnap, holidayBoost])

  const maxGap = useMemo(() => Math.max(0, ...forecastPoints.map(d => d.predictedLoad - d.capacity)), [forecastPoints])
  const plans = useMemo(() => computePeakShavingPlans(maxGap), [maxGap])
  const exceedsCapacity = maxGap > 0

  const markAreas = useMemo(() => {
    const ranges: { xAxis: number }[] = []
    let inRange = false
    forecastPoints.forEach((d, i) => {
      if (d.predictedLoad > d.capacity && !inRange) {
        ranges.push({ xAxis: i })
        inRange = true
      } else if (d.predictedLoad <= d.capacity && inRange) {
        ranges.push({ xAxis: i - 1 })
        inRange = false
      }
    })
    if (inRange) ranges.push({ xAxis: forecastPoints.length - 1 })
    const result: [number, number][] = []
    for (let i = 0; i < ranges.length; i += 2) {
      if (i + 1 < ranges.length) result.push([ranges[i].xAxis, ranges[i + 1].xAxis])
    }
    return result
  }, [forecastPoints])

  const chartOption = useMemo(
    () => ({
      backgroundColor: '#1E293B',
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: '#1E293B',
        borderColor: '#334155',
        textStyle: { color: '#E2E8F0' },
      },
      legend: {
        data: ['预测负荷', '容量上限', '温度'],
        textStyle: { color: '#94A3B8' },
        top: 0,
      },
      grid: { left: 60, right: 60, top: 40, bottom: 30 },
      xAxis: {
        type: 'category' as const,
        data: forecastPoints.map((d) => d.timestamp),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: {
          color: '#94A3B8',
          interval: 5,
          fontSize: 10,
          rotate: 30,
        },
      },
      yAxis: [
        {
          type: 'value' as const,
          name: '负荷 (MW)',
          nameTextStyle: { color: '#94A3B8' },
          axisLine: { lineStyle: { color: '#334155' } },
          splitLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94A3B8' },
        },
        {
          type: 'value' as const,
          name: '温度 (°C)',
          nameTextStyle: { color: '#94A3B8' },
          axisLine: { lineStyle: { color: '#334155' } },
          splitLine: { show: false },
          axisLabel: { color: '#94A3B8' },
        },
      ],
      series: [
        {
          name: '预测负荷',
          type: 'line' as const,
          data: forecastPoints.map((d) => d.predictedLoad),
          lineStyle: { color: '#F97316', width: 2 },
          itemStyle: { color: '#F97316' },
          areaStyle: {
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(249,115,22,0.35)' },
                { offset: 1, color: 'rgba(249,115,22,0.02)' },
              ],
            },
          },
          markArea: markAreas.length
            ? {
                silent: true,
                itemStyle: { color: 'rgba(239,68,68,0.15)' },
                data: markAreas.map(([start, end]) => [{ xAxis: start }, { xAxis: end }]),
              }
            : undefined,
        },
        {
          name: '容量上限',
          type: 'line' as const,
          data: forecastPoints.map((d) => d.capacity),
          lineStyle: { color: '#EF4444', width: 2, type: 'dashed' as const },
          itemStyle: { color: '#EF4444' },
          symbol: 'none',
        },
        {
          name: '温度',
          type: 'line' as const,
          yAxisIndex: 1,
          data: forecastPoints.map((d) => d.temperature),
          lineStyle: { color: '#3B82F6', width: 2 },
          itemStyle: { color: '#3B82F6' },
          symbol: 'circle',
          symbolSize: 3,
        },
      ],
    }),
    [markAreas, forecastPoints],
  )

  const handleWeatherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = evt.target?.result
      const workbook = read(data, { type: 'binary' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows: string[][] = []
      for (let i = 2; ; i++) {
        const cell = sheet[`A${i}`]
        if (!cell) break
        rows.push([
          sheet[`A${i}`]?.v ?? '',
          sheet[`B${i}`]?.v ?? '',
          sheet[`C${i}`]?.v ?? '',
        ])
      }
      const temps = rows.map((r) => Number(r[1])).filter((t) => !isNaN(t))
      setParsedTemps(temps)
      const coldDetected = temps.some((t) => t < -15)
      setHasColdSnap(coldDetected)
      setWeatherFile(file.name)
      setWeatherSummary({
        tempRange: temps.length
          ? `${Math.min(...temps).toFixed(1)}°C ~ ${Math.max(...temps).toFixed(1)}°C`
          : '无法解析',
        coldSnap: coldDetected,
      })
    }
    reader.readAsBinaryString(file)
  }

  const handleHolidayPlanChange = (value: string) => {
    setHolidayPlan(value)
    setHolidayBoost(value.trim().length > 0 ? 1200 : 0)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 space-y-6">
      <div className="flex items-center gap-2 text-xl font-bold text-white">
        <TrendingUp className="w-6 h-6 text-[#F97316]" />
        负荷预测与调度
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <label className="border-2 border-dashed border-[#334155] rounded-lg p-6 bg-[#1E293B] hover:border-[#F97316] transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[140px]">
          <FileSpreadsheet className="w-8 h-8 text-[#F97316]" />
          <span className="text-[#94A3B8] text-sm">拖拽或点击上传天气预报 Excel</span>
          <span className="text-[#64748B] text-xs">支持 .xlsx / .xls</span>
          <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleWeatherUpload} />
        </label>
        {weatherFile && (
          <div className="border border-[#334155] rounded-lg p-4 bg-[#1E293B] flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2 text-[#F97316] text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              已解析: {weatherFile}
            </div>
            {weatherSummary && (
              <div className="text-[#94A3B8] text-sm space-y-1">
                <p>温度范围: <span className="font-mono text-white">{weatherSummary.tempRange}</span></p>
                {weatherSummary.coldSnap && (
                  <p className="text-red-400 flex items-center gap-1">
                    <CloudSnow className="w-4 h-4" /> 寒潮预警
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="border-2 border-dashed border-[#334155] rounded-lg p-6 bg-[#1E293B] hover:border-[#F97316] transition-colors flex flex-col justify-center gap-3 min-h-[140px]">
          <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
            <Upload className="w-5 h-5 text-[#F97316]" />
            节假日活动计划
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={holidayPlan}
              onChange={(e) => handleHolidayPlanChange(e.target.value)}
              placeholder="输入或上传活动计划"
              className="flex-1 bg-[#0F172A] border border-[#334155] rounded px-3 py-1.5 text-sm text-white placeholder-[#64748B] outline-none focus:border-[#F97316]"
            />
            <label className="px-3 py-1.5 bg-[#F97316] text-white text-sm rounded cursor-pointer hover:bg-[#EA580C] transition-colors">
              上传
              <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleHolidayPlanChange(e.target.files[0].name) }} />
            </label>
          </div>
          {holidayPlan && (
            <p className="text-xs text-[#94A3B8]">
              当前计划: <span className="text-[#F97316] font-mono">{holidayPlan}</span>
            </p>
          )}
        </div>

        <div className="border border-[#334155] rounded-lg p-4 bg-[#1E293B] flex items-center gap-4">
          <Cloud className="w-8 h-8 text-[#3B82F6]" />
          <div className="space-y-1">
            <p className="text-[#94A3B8] text-sm">当前天气</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white font-mono">{forecastPoints[0].temperature}°C</span>
              <span className="text-[#94A3B8] flex items-center gap-1">
                <Wind className="w-4 h-4" /> 3-4级
              </span>
              <span className="text-[#94A3B8] flex items-center gap-1">
                <CloudSnow className="w-4 h-4" /> 小雪
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-[#334155] rounded-lg bg-[#1E293B] p-4">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#F97316]" />
          48小时负荷预测
          {exceedsCapacity && (
            <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded ml-2">
              存在超负荷时段
            </span>
          )}
        </h3>
        <ReactECharts option={chartOption} style={{ height: 360 }} />
      </div>

      {exceedsCapacity && (
        <div>
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#F97316]" />
            削峰方案推荐
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.planId
              return (
                <div
                  key={plan.planId}
                  onClick={() => setSelectedPlan(plan.planId)}
                  className={`border rounded-lg p-5 bg-[#1E293B] cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#F97316] shadow-[0_0_16px_rgba(249,115,22,0.3)]'
                      : 'border-[#334155] hover:border-[#F97316]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">{plan.name}</span>
                    <span className="text-xs bg-[#F97316]/20 text-[#F97316] px-2 py-0.5 rounded font-mono">
                      优先级 {plan.priority}
                    </span>
                  </div>
                  <p className="text-[#94A3B8] text-sm mb-3">{plan.description}</p>
                  <div className="space-y-2 text-sm">
                    <p className="text-[#94A3B8]">
                      预期效果: <span className="text-white font-mono">{plan.expectedEffect}</span>
                    </p>
                    <p className="text-[#94A3B8]">
                      影响范围: <span className="text-white">{plan.affectedScope}</span>
                    </p>
                  </div>
                  <button
                    className={`mt-4 w-full py-2 rounded text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#F97316] text-white'
                        : 'bg-[#334155] text-[#94A3B8] hover:bg-[#F97316] hover:text-white'
                    }`}
                  >
                    {isSelected ? '已选择' : '选择方案'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
